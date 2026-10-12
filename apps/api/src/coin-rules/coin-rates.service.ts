import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from '../auth/auth.service.js';
import { nextCutoff } from './coin-rules.service.js';

const HALF_DAY = 12 * 60 * 60 * 1000;
export function currentRatePeriod(now: Date) {
  const endsAt = nextCutoff(now);
  return { startsAt: new Date(endsAt.getTime() - HALF_DAY), endsAt };
}

@Injectable()
export class CoinRatesService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(CoinRatesService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private lastWarningPeriod?: string;

  constructor(
    private readonly db: PrismaService,
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  async generateManual(body: unknown, authorization?: string) {
    const user = await this.auth.me(authorization);
    if (user.role !== 'GOVERNMENT')
      throw new ForbiddenException('เฉพาะเจ้าหน้าที่ภาครัฐ');
    if (this.config.get<string>('NODE_ENV') === 'production')
      throw new ForbiddenException('ปุ่มสร้างรอบทดสอบใช้ได้เฉพาะระบบทดสอบ');
    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).length
    )
      throw new BadRequestException(
        'ส่งข้อมูลว่าง {} เท่านั้น ระบบกำหนดรอบและเรตให้',
      );
    return this.generateCurrent();
  }

  async generateCurrent(now = new Date()) {
    return this.db.$transaction(
      async (tx) => {
        // Shared with rule writers; concurrent workers/manual requests reuse the winner.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(726031)`;
        const { startsAt, endsAt } = currentRatePeriod(now);
        const existing = await tx.coin_rate_periods.findUnique({
          where: { starts_at: startsAt },
          include: { _count: { select: { shop_coin_rates: true } } },
        });
        if (existing) {
          if (existing.ends_at.getTime() !== endsAt.getTime())
            throw new ConflictException('ช่วงรอบเดิมไม่ตรงกับรอบอัตโนมัติ');
          return {
            periodId: existing.period_id.toString(),
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            created: false,
            shopCount: existing._count.shop_coin_rates,
          };
        }
        const overlap = await tx.coin_rate_periods.findFirst({
          where: { starts_at: { lt: endsAt }, ends_at: { gt: startsAt } },
          select: { period_id: true },
        });
        if (overlap) throw new ConflictException('มีรอบเดิมทับช่วงเวลานี้');
        const rule = await tx.coin_rule_versions.findFirst({
          where: {
            effective_from: { lte: startsAt },
            OR: [{ effective_to: null }, { effective_to: { gt: startsAt } }],
          },
          orderBy: { version: 'desc' },
        });
        if (!rule)
          throw new ConflictException(
            'ไม่มีกฎที่มีผลตอนเริ่มรอบ กรุณาสร้างกฎและรอรอบถัดไป',
          );
        const windowStart = new Date(
          startsAt.getTime() - rule.sales_window_days * 86400000,
        );
        const shops = await tx.shops.findMany({
          where: { participation_status: 'APPROVED' },
          select: { shop_id: true },
          orderBy: { shop_id: 'asc' },
        });
        const totals = await tx.purchases.groupBy({
          by: ['shop_id'],
          where: {
            confirmed_at: { gte: windowStart, lt: startsAt },
            OR: [
              { status: 'SUCCEEDED' },
              { status: 'REFUNDED', refunded_at: { gte: startsAt } },
            ],
          },
          _sum: { total_amount: true },
        });
        const sales = new Map(
          totals.map((row) => [row.shop_id, row._sum.total_amount]),
        );
        const period = await tx.coin_rate_periods.create({
          data: { starts_at: startsAt, ends_at: endsAt },
        });
        if (shops.length)
          await tx.shop_coin_rates.createMany({
            data: shops.map((shop) => {
              const total = sales.get(shop.shop_id) ?? new Prisma.Decimal(0);
              return {
                period_id: period.period_id,
                shop_id: shop.shop_id,
                rule_id: rule.rule_id,
                new_customer_coins: total.lt(rule.low_sales_threshold)
                  ? rule.new_low_sales_coins
                  : rule.new_other_coins,
                repeat_customer_coins: rule.repeat_coins,
                sales_total_snapshot: total,
                sales_window_starts_at: windowStart,
                sales_window_ends_at: startsAt,
              };
            }),
          });
        return {
          periodId: period.period_id.toString(),
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          created: true,
          shopCount: shops.length,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  onApplicationBootstrap() {
    if (this.config.get<string>('ENABLE_AUTO_COIN_RATES') === 'false') return;
    this.timer = setInterval(() => {
      void this.runAutomatic();
    }, 60000);
    this.timer.unref();
    void this.runAutomatic();
  }

  async runAutomatic() {
    if (this.running) return;
    this.running = true;
    try {
      const result = await this.generateCurrent();
      if (result.created)
        this.logger.log(
          `Generated period ${result.startsAt}: ${result.shopCount} shops`,
        );
      this.lastWarningPeriod = undefined;
    } catch (error) {
      const key = currentRatePeriod(new Date()).startsAt.toISOString();
      if (key !== this.lastWarningPeriod) {
        // Do not log database URLs, driver errors, or credentials.
        this.logger.warn(
          error instanceof ConflictException
            ? error.message
            : 'Coin rate generation failed; retrying next minute',
        );
        this.lastWarningPeriod = key;
      }
    } finally {
      this.running = false;
    }
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
