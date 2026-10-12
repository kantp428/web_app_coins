import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Headers,
  Injectable,
  OnModuleDestroy,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthService } from '../auth/auth.service.js';

export type RuleInput = {
  minimumPurchase: string;
  lowSalesThreshold: string;
  salesWindowDays: number;
  repeatCoins: number;
  newLowSalesCoins: number;
  newOtherCoins: number;
};
export function validRule(body: unknown): body is RuleInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  const b = body as RuleInput;
  const keys = [
    'minimumPurchase',
    'lowSalesThreshold',
    'salesWindowDays',
    'repeatCoins',
    'newLowSalesCoins',
    'newOtherCoins',
  ];
  const money = (v: unknown) =>
    typeof v === 'string' && /^(0|[1-9][0-9]{0,11})(\.[0-9]{1,2})?$/.test(v);
  return (
    Object.keys(b).every((k) => keys.includes(k)) &&
    money(b.minimumPurchase) &&
    Number(b.minimumPurchase) > 0 &&
    money(b.lowSalesThreshold) &&
    Number.isInteger(b.salesWindowDays) &&
    b.salesWindowDays > 0 &&
    b.salesWindowDays <= 3650 &&
    b.repeatCoins === 1 &&
    Number.isInteger(b.newLowSalesCoins) &&
    b.newLowSalesCoins >= 8 &&
    b.newLowSalesCoins <= 10 &&
    Number.isInteger(b.newOtherCoins) &&
    b.newOtherCoins >= 1 &&
    b.newOtherCoins <= b.newLowSalesCoins
  );
}
export function nextCutoff(now: Date) {
  // 06:00/18:00 Bangkok = 23:00(previous day)/11:00 UTC.
  const day = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return new Date(
    [
      day - 3600000,
      day + 11 * 3600000,
      day + 23 * 3600000,
      day + 35 * 3600000,
    ].find((t) => t > now.getTime())!,
  );
}
function jsonValue(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_, v: unknown) =>
      typeof v === 'bigint' ? v.toString() : v,
    ),
  );
}
@Injectable()
export class CoinRulesService implements OnModuleDestroy {
  private readonly db: PrismaClient;
  constructor(
    config: ConfigService,
    private readonly auth: AuthService,
  ) {
    this.db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: config.get<string>('DATABASE_URL'),
      }),
    });
  }
  async officer(authorization?: string) {
    const user = await this.auth.me(authorization);
    if (user.role !== 'GOVERNMENT')
      throw new ForbiddenException('เฉพาะเจ้าหน้าที่ภาครัฐ');
    return user;
  }
  async list(authorization?: string) {
    await this.officer(authorization);
    const [rules, periods] = await Promise.all([
      this.db.coin_rule_versions.findMany({
        orderBy: { version: 'desc' },
        take: 50,
      }),
      this.db.coin_rate_periods.findMany({
        orderBy: { starts_at: 'desc' },
        take: 10,
        include: {
          shop_coin_rates: {
            include: { shops: { select: { name: true } } },
            orderBy: { shop_id: 'asc' },
            take: 100,
          },
          _count: { select: { shop_coin_rates: true } },
        },
      }),
    ]);
    const now = new Date();
    return jsonValue({
      rules,
      periods,
      serverTime: now,
      nextEffectiveAt: nextCutoff(now),
    });
  }
  async create(body: unknown, authorization?: string) {
    const user = await this.officer(authorization);
    if (!validRule(body))
      throw new BadRequestException('ตรวจสอบจำนวน Coins ยอดเงิน และจำนวนวัน');
    return this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(726031)`;
      const now = new Date();
      const effective = nextCutoff(now);
      const latest = await tx.coin_rule_versions.findFirst({
        orderBy: { version: 'desc' },
      });
      if (latest && latest.effective_from > now)
        throw new ConflictException('มีกฎรอเริ่มใช้งานแล้ว กรุณารอรอบถัดไป');
      if (latest && (!latest.effective_to || latest.effective_to > effective))
        await tx.coin_rule_versions.update({
          where: { rule_id: latest.rule_id },
          data: { effective_to: effective },
        });
      const rule = await tx.coin_rule_versions.create({
        data: {
          version: (latest?.version ?? 0) + 1,
          created_by: BigInt(user.id),
          creator_role: 'GOVERNMENT',
          effective_from: effective,
          minimum_purchase: body.minimumPurchase,
          low_sales_threshold: body.lowSalesThreshold,
          sales_window_days: body.salesWindowDays,
          repeat_coins: body.repeatCoins,
          new_low_sales_coins: body.newLowSalesCoins,
          new_other_coins: body.newOtherCoins,
        },
      });
      return jsonValue(rule);
    });
  }
  async onModuleDestroy() {
    await this.db.$disconnect();
  }
}
@Controller('government/coin-rules')
export class CoinRulesController {
  constructor(private readonly rules: CoinRulesService) {}
  @Get()
  @Header('Cache-Control', 'no-store')
  list(@Headers('authorization') authorization?: string) {
    return this.rules.list(authorization);
  }
  @Post()
  @Header('Cache-Control', 'no-store')
  create(
    @Body() body: unknown,
    @Headers('authorization') authorization?: string,
  ) {
    return this.rules.create(body, authorization);
  }
}
