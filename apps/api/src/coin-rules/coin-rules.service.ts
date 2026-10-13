import { ruleScaleDetail } from './coin-scale.js';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthService } from '../auth/auth.service.js';
import { sqlTable } from '../prisma/sql-table.js';

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
type RatePeriodSummary = {
  period_id: bigint;
  starts_at: Date;
  ends_at: Date;
  created_at: Date;
  shopCount: number;
  belowThresholdShopCount: number;
  atOrAboveThresholdShopCount: number;
  coinsAwarded: string;
};
export function readRatePeriodSummaries(
  db: Pick<PrismaClient, '$queryRaw'>,
  schema = 'public',
) {
  return db.$queryRaw<RatePeriodSummary[]>`
        WITH recent_periods AS (
          SELECT period_id, starts_at, ends_at, created_at
          FROM ${sqlTable('coin_rate_periods', schema)} ORDER BY starts_at DESC LIMIT 10
        ), shop_counts AS (
          SELECT r.period_id, COUNT(*)::int AS shop_count,
            COUNT(*) FILTER (WHERE r.sales_total_snapshot < 10000)::int AS below_count,
            COUNT(*) FILTER (WHERE r.sales_total_snapshot >= 10000)::int AS above_count
          FROM ${sqlTable('shop_coin_rates', schema)} r JOIN recent_periods p ON p.period_id = r.period_id
          GROUP BY r.period_id
        ), coin_totals AS (
          SELECT p.period_id, SUM(c.coins) AS awarded
          FROM recent_periods p JOIN ${sqlTable('coin_entries', schema)} c
            ON c.awarded_at >= p.starts_at AND c.awarded_at < p.ends_at
          GROUP BY p.period_id
        )
        SELECT p.*, COALESCE(s.shop_count, 0) AS "shopCount",
          COALESCE(s.below_count, 0) AS "belowThresholdShopCount",
          COALESCE(s.above_count, 0) AS "atOrAboveThresholdShopCount",
          COALESCE(c.awarded, 0)::text AS "coinsAwarded"
        FROM recent_periods p
        LEFT JOIN shop_counts s ON s.period_id = p.period_id
        LEFT JOIN coin_totals c ON c.period_id = p.period_id
        ORDER BY p.starts_at DESC
      `;
}
@Injectable()
export class CoinRulesService implements OnModuleDestroy {
  private readonly db: PrismaClient;
  constructor(
    private readonly config: ConfigService,
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
      readRatePeriodSummaries(this.db),
    ]);
    const now = new Date();
    return jsonValue({
      rules: rules.map((rule) => ({
        ...rule,
        calculationDetail: ruleScaleDetail(rule),
      })),
      periods,
      serverTime: now,
      nextEffectiveAt: nextCutoff(now),
      automaticGenerationEnabled:
        this.config.get<string>('ENABLE_AUTO_COIN_RATES') !== 'false',
      manualGenerationEnabled:
        this.config.get<string>('NODE_ENV') !== 'production',
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
