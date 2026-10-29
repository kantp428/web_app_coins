import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from '../auth/auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { sqlTable } from '../prisma/sql-table.js';

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 731;

type ReportRange = {
  from: string;
  to: string;
  start: Date;
  end: Date;
};

type DashboardKpisRow = {
  totalSales: string;
  baseSubsidy: string;
  rewardSubsidy: string;
  citizensUsingBenefit: number;
  transactingShops: number;
  rewardRecipients: number;
};

type BudgetRow = {
  budgetLimit: string;
  spent: string;
  remaining: string;
};

type MonthlySpendingRow = {
  month: string;
  totalSales: string;
  baseSubsidy: string;
  rewardSubsidy: string;
  transactionCount: number;
  uniqueCustomers: number;
  averageTransaction: string;
};

type SizeRow = {
  size: string;
  sales: string;
  transactionCount: number;
};

type BudgetMonthRow = BudgetRow & {
  month: string;
  status: string;
};

type TopShopRow = {
  shopId: bigint;
  name: string;
  sales: string;
  transactionCount: number;
};

type CategoryRow = {
  categoryId: bigint;
  name: string;
  transactingShops: number;
  sales: string;
};

type CustomerSummaryRow = {
  transactionCount: number;
  uniqueCustomers: number;
  averageTransaction: string;
  firstTransactions: number;
  repeatTransactions: number;
};

type CoinRewardRow = {
  month: string;
  coinsAwarded: string;
  coinAwards: number;
  rewardRecipients: number;
  rewardAllocation: string;
};

function bangkokToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function dateBoundary(value: string, nextDay = false) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new BadRequestException('วันที่รายงานไม่ถูกต้อง');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    year < 2000 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > new Date(Date.UTC(year, month, 0)).getUTCDate()
  )
    throw new BadRequestException('วันที่รายงานไม่ถูกต้อง');
  return new Date(
    Date.UTC(year, month - 1, day + (nextDay ? 1 : 0)) - BANGKOK_OFFSET_MS,
  );
}

export function parseReportRange(
  query: Record<string, unknown>,
  now = new Date(),
): ReportRange {
  if (Object.keys(query).some((key) => !['from', 'to'].includes(key)))
    throw new BadRequestException('ตัวกรองรายงานไม่ถูกต้อง');
  if (
    (query.from === undefined) !== (query.to === undefined) ||
    (query.from !== undefined && typeof query.from !== 'string') ||
    (query.to !== undefined && typeof query.to !== 'string')
  )
    throw new BadRequestException('กรุณาระบุวันที่เริ่มต้นและสิ้นสุด');
  const today = bangkokToday(now);
  const from =
    (query.from as string | undefined) ?? `${today.slice(0, 4)}-01-01`;
  const to = (query.to as string | undefined) ?? today;
  const start = dateBoundary(from);
  const end = dateBoundary(to, true);
  const days = (end.getTime() - start.getTime()) / DAY_MS;
  if (days <= 0)
    throw new BadRequestException('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด');
  if (days > MAX_RANGE_DAYS)
    throw new BadRequestException('ช่วงรายงานต้องไม่เกิน 731 วัน');
  return { from, to, start, end };
}

export function usagePercent(spent: string, limit: string) {
  const budget = new Prisma.Decimal(limit);
  if (budget.isZero()) return 0;
  return Number(
    new Prisma.Decimal(spent)
      .mul(100)
      .div(budget)
      .toDecimalPlaces(1)
      .toString(),
  );
}

export function summarizeBudget(
  rows: Array<{ budgetLimit: string; spent: string }>,
) {
  const totals = rows.reduce(
    (total, row) => ({
      budgetLimit: total.budgetLimit.add(row.budgetLimit),
      spent: total.spent.add(row.spent),
    }),
    {
      budgetLimit: new Prisma.Decimal(0),
      spent: new Prisma.Decimal(0),
    },
  );
  return {
    budgetLimit: totals.budgetLimit.toFixed(2),
    spent: totals.spent.toFixed(2),
    remaining: totals.budgetLimit.minus(totals.spent).toFixed(2),
  };
}

const definitions = {
  netSales: 'ยอดซื้อสำเร็จสุทธิ โดยไม่นับรายการคืนเงิน',
  benefitUsers: 'ประชาชนไม่ซ้ำที่ใช้ Base หรือ Main Quest ในรายการสำเร็จ',
  budget:
    'งบ Main Quest จาก monthly_periods; ยอดใช้จริงมาจาก reward_subsidy_used ของรายการสำเร็จ',
  repeat:
    'รายการซื้อซ้ำเมื่อมีประวัติ SUCCEEDED หรือ REFUNDED ก่อนหน้าที่ร้านเดิม',
  coins: 'Coins ที่ยังไม่ถูกยกเลิกและผูกกับรายการซื้อที่ยังสำเร็จ',
};

const limitations = [
  'ไม่มีเพดานงบรวมของ Base Subsidy ใน schema จึงแสดงได้เฉพาะยอดใช้จริง ไม่รวมในงบคงเหลือ',
  'งบ Main Quest เป็นรายเดือน การใช้ช่วงวันที่บางส่วนจึงนับเพดานงบเต็มของเดือนที่ช่วงวันที่ทับซ้อน',
  'ระบบปัจจุบันรองรับการคืนเงินเต็มจำนวนเท่านั้น ไม่มีข้อมูล partial refund ให้คำนวณ',
  'ร้านหนึ่งร้านมีหลายหมวดได้ จำนวนร้านในแต่ละหมวดจึงอาจซ้ำกัน',
];

@Injectable()
export class GovernmentReportsService {
  private readonly schema: string;

  constructor(
    private readonly db: PrismaService,
    private readonly auth: AuthService,
  ) {
    this.schema = db.databaseSchema;
  }

  private async officer(authorization?: string) {
    const user = await this.auth.me(authorization);
    if (user.role !== 'GOVERNMENT')
      throw new ForbiddenException('เฉพาะเจ้าหน้าที่ภาครัฐ');
  }

  private filter(range: ReportRange) {
    return {
      from: range.from,
      to: range.to,
      timezone: 'Asia/Bangkok',
    };
  }

  private async monthlySpending(range: ReportRange) {
    const purchases = sqlTable('purchases', this.schema);
    return this.db.$queryRaw<MonthlySpendingRow[]>`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', ${range.start}::timestamptz AT TIME ZONE 'Asia/Bangkok'),
          date_trunc('month', (${range.end}::timestamptz - interval '1 microsecond') AT TIME ZONE 'Asia/Bangkok'),
          interval '1 month'
        ) AS month
      ), spending AS (
        SELECT date_trunc('month', confirmed_at AT TIME ZONE 'Asia/Bangkok') AS month,
          SUM(total_amount) AS total_sales,
          SUM(base_subsidy_used) AS base_subsidy,
          SUM(reward_subsidy_used) AS reward_subsidy,
          COUNT(*)::int AS transaction_count,
          COUNT(DISTINCT customer_id)::int AS unique_customers,
          AVG(total_amount) AS average_transaction
        FROM ${purchases}
        WHERE status = 'SUCCEEDED' AND confirmed_at >= ${range.start} AND confirmed_at < ${range.end}
        GROUP BY 1
      )
      SELECT TO_CHAR(m.month, 'YYYY-MM') AS month,
        COALESCE(s.total_sales, 0)::numeric(14,2)::text AS "totalSales",
        COALESCE(s.base_subsidy, 0)::numeric(14,2)::text AS "baseSubsidy",
        COALESCE(s.reward_subsidy, 0)::numeric(14,2)::text AS "rewardSubsidy",
        COALESCE(s.transaction_count, 0)::int AS "transactionCount",
        COALESCE(s.unique_customers, 0)::int AS "uniqueCustomers",
        COALESCE(s.average_transaction, 0)::numeric(14,2)::text AS "averageTransaction"
      FROM months m LEFT JOIN spending s ON s.month = m.month ORDER BY m.month`;
  }

  private async budgetRows(range: ReportRange) {
    const periods = sqlTable('monthly_periods', this.schema);
    const purchases = sqlTable('purchases', this.schema);
    return this.db.$queryRaw<BudgetMonthRow[]>`
      SELECT TO_CHAR(m.month_key, 'YYYY-MM') AS month, m.status,
        m.budget_limit::numeric(14,2)::text AS "budgetLimit",
        COALESCE(SUM(p.reward_subsidy_used), 0)::numeric(14,2)::text AS spent,
        (m.budget_limit - COALESCE(SUM(p.reward_subsidy_used), 0))::numeric(14,2)::text AS remaining
      FROM ${periods} m
      LEFT JOIN ${purchases} p ON p.status = 'SUCCEEDED'
        AND p.confirmed_at >= m.starts_at AND p.confirmed_at < m.ends_at
      WHERE m.starts_at < ${range.end} AND m.ends_at > ${range.start}
      GROUP BY m.period_id, m.month_key, m.status, m.budget_limit
      ORDER BY m.month_key`;
  }

  private async salesBySize(range: ReportRange) {
    const purchases = sqlTable('purchases', this.schema);
    return this.db.$queryRaw<SizeRow[]>`
      WITH sizes(size, position) AS (VALUES ('SMALL', 1), ('MEDIUM', 2), ('LARGE', 3))
      SELECT s.size, COALESCE(SUM(p.total_amount), 0)::numeric(14,2)::text AS sales,
        COUNT(p.purchase_id)::int AS "transactionCount"
      FROM sizes s LEFT JOIN ${purchases} p ON p.shop_size_snapshot = s.size
        AND p.status = 'SUCCEEDED' AND p.confirmed_at >= ${range.start} AND p.confirmed_at < ${range.end}
      GROUP BY s.size, s.position ORDER BY s.position`;
  }

  async dashboard(query: Record<string, unknown>, authorization?: string) {
    await this.officer(authorization);
    const range = parseReportRange(query);
    const purchases = sqlTable('purchases', this.schema);
    const grants = sqlTable('reward_grants', this.schema);
    const [kpiRows, trends, budgetMonths, salesByShopSize] = await Promise.all([
      this.db.$queryRaw<DashboardKpisRow[]>`
        SELECT COALESCE(SUM(total_amount), 0)::numeric(14,2)::text AS "totalSales",
          COALESCE(SUM(base_subsidy_used), 0)::numeric(14,2)::text AS "baseSubsidy",
          COALESCE(SUM(reward_subsidy_used), 0)::numeric(14,2)::text AS "rewardSubsidy",
          COUNT(DISTINCT customer_id) FILTER (WHERE base_subsidy_used > 0 OR reward_subsidy_used > 0)::int AS "citizensUsingBenefit",
          COUNT(DISTINCT shop_id)::int AS "transactingShops",
          (SELECT COUNT(DISTINCT user_id)::int FROM ${grants}
            WHERE granted_at >= ${range.start} AND granted_at < ${range.end}) AS "rewardRecipients"
        FROM ${purchases}
        WHERE status = 'SUCCEEDED' AND confirmed_at >= ${range.start} AND confirmed_at < ${range.end}`,
      this.monthlySpending(range),
      this.budgetRows(range),
      this.salesBySize(range),
    ]);
    const kpis = kpiRows[0] ?? {
      totalSales: '0.00',
      baseSubsidy: '0.00',
      rewardSubsidy: '0.00',
      citizensUsingBenefit: 0,
      transactingShops: 0,
      rewardRecipients: 0,
    };
    const budget = summarizeBudget(budgetMonths);
    return {
      filters: this.filter(range),
      kpis: {
        budgetSpent: budget.spent,
        budgetRemaining: budget.remaining,
        totalSales: kpis.totalSales,
        citizensUsingBenefit: kpis.citizensUsingBenefit,
        transactingShops: kpis.transactingShops,
        rewardRecipients: kpis.rewardRecipients,
      },
      trends: trends.map((row) => ({
        month: row.month,
        totalSales: row.totalSales,
        totalSubsidy: new Prisma.Decimal(row.baseSubsidy)
          .add(row.rewardSubsidy)
          .toFixed(2),
        baseSubsidy: row.baseSubsidy,
        rewardSubsidy: row.rewardSubsidy,
      })),
      budgetUtilization: {
        ...budget,
        usagePercent: usagePercent(budget.spent, budget.budgetLimit),
      },
      salesByShopSize,
      definitions,
      limitations,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  async analysis(query: Record<string, unknown>, authorization?: string) {
    await this.officer(authorization);
    const range = parseReportRange(query);
    const purchases = sqlTable('purchases', this.schema);
    const shops = sqlTable('shops', this.schema);
    const shopCategories = sqlTable('shop_categories', this.schema);
    const categories = sqlTable('categories', this.schema);
    const coinEntries = sqlTable('coin_entries', this.schema);
    const grants = sqlTable('reward_grants', this.schema);
    const [
      monthlySpending,
      utilization,
      salesBySize,
      topShops,
      categoryDistribution,
      customerSummaries,
      coinsAndRewards,
    ] = await Promise.all([
      this.monthlySpending(range),
      this.budgetRows(range),
      this.salesBySize(range),
      this.db.$queryRaw<TopShopRow[]>`
        SELECT s.shop_id AS "shopId", s.name,
          SUM(p.total_amount)::numeric(14,2)::text AS sales,
          COUNT(*)::int AS "transactionCount"
        FROM ${purchases} p JOIN ${shops} s ON s.shop_id = p.shop_id
        WHERE p.status = 'SUCCEEDED' AND p.confirmed_at >= ${range.start} AND p.confirmed_at < ${range.end}
        GROUP BY s.shop_id, s.name
        ORDER BY SUM(p.total_amount) DESC, COUNT(*) DESC, s.shop_id LIMIT 10`,
      this.db.$queryRaw<CategoryRow[]>`
        SELECT c.category_id AS "categoryId", c.name,
          COUNT(DISTINCT p.shop_id)::int AS "transactingShops",
          COALESCE(SUM(p.total_amount), 0)::numeric(14,2)::text AS sales
        FROM ${categories} c
        LEFT JOIN ${shopCategories} sc ON sc.category_id = c.category_id
        LEFT JOIN ${purchases} p ON p.shop_id = sc.shop_id AND p.status = 'SUCCEEDED'
          AND p.confirmed_at >= ${range.start} AND p.confirmed_at < ${range.end}
        GROUP BY c.category_id, c.name
        ORDER BY SUM(p.total_amount) DESC NULLS LAST, c.name`,
      this.db.$queryRaw<CustomerSummaryRow[]>`
        WITH current_purchases AS (
          SELECT p.*, EXISTS (
            SELECT 1 FROM ${purchases} prior
            WHERE prior.customer_id = p.customer_id AND prior.shop_id = p.shop_id
              AND prior.status IN ('SUCCEEDED', 'REFUNDED') AND prior.confirmed_at IS NOT NULL
              AND (prior.confirmed_at < p.confirmed_at OR
                (prior.confirmed_at = p.confirmed_at AND prior.purchase_id < p.purchase_id))
          ) AS is_repeat
          FROM ${purchases} p
          WHERE p.status = 'SUCCEEDED' AND p.confirmed_at >= ${range.start} AND p.confirmed_at < ${range.end}
        )
        SELECT COUNT(*)::int AS "transactionCount",
          COUNT(DISTINCT customer_id)::int AS "uniqueCustomers",
          COALESCE(AVG(total_amount), 0)::numeric(14,2)::text AS "averageTransaction",
          COUNT(*) FILTER (WHERE NOT is_repeat)::int AS "firstTransactions",
          COUNT(*) FILTER (WHERE is_repeat)::int AS "repeatTransactions"
        FROM current_purchases`,
      this.db.$queryRaw<CoinRewardRow[]>`
        WITH months AS (
          SELECT generate_series(
            date_trunc('month', ${range.start}::timestamptz AT TIME ZONE 'Asia/Bangkok'),
            date_trunc('month', (${range.end}::timestamptz - interval '1 microsecond') AT TIME ZONE 'Asia/Bangkok'),
            interval '1 month'
          ) AS month
        ), coins AS (
          SELECT date_trunc('month', c.awarded_at AT TIME ZONE 'Asia/Bangkok') AS month,
            SUM(c.coins)::text AS coins_awarded, COUNT(*)::int AS coin_awards
          FROM ${coinEntries} c JOIN ${purchases} p ON p.purchase_id = c.purchase_id
          WHERE c.reversed_at IS NULL AND p.status = 'SUCCEEDED'
            AND c.awarded_at >= ${range.start} AND c.awarded_at < ${range.end}
          GROUP BY 1
        ), rewards AS (
          SELECT date_trunc('month', granted_at AT TIME ZONE 'Asia/Bangkok') AS month,
            COUNT(DISTINCT user_id)::int AS recipients, SUM(amount) AS allocation
          FROM ${grants}
          WHERE granted_at >= ${range.start} AND granted_at < ${range.end}
          GROUP BY 1
        )
        SELECT TO_CHAR(m.month, 'YYYY-MM') AS month,
          COALESCE(c.coins_awarded, '0') AS "coinsAwarded",
          COALESCE(c.coin_awards, 0)::int AS "coinAwards",
          COALESCE(r.recipients, 0)::int AS "rewardRecipients",
          COALESCE(r.allocation, 0)::numeric(14,2)::text AS "rewardAllocation"
        FROM months m LEFT JOIN coins c ON c.month = m.month
          LEFT JOIN rewards r ON r.month = m.month ORDER BY m.month`,
    ]);
    const customerSummary = customerSummaries[0] ?? {
      transactionCount: 0,
      uniqueCustomers: 0,
      averageTransaction: '0.00',
      firstTransactions: 0,
      repeatTransactions: 0,
    };
    const baseSubsidy = monthlySpending.reduce(
      (sum, row) => sum.add(row.baseSubsidy),
      new Prisma.Decimal(0),
    );
    const rewardSubsidy = monthlySpending.reduce(
      (sum, row) => sum.add(row.rewardSubsidy),
      new Prisma.Decimal(0),
    );
    return {
      filters: this.filter(range),
      budget: {
        subsidySplit: {
          baseSubsidy: baseSubsidy.toFixed(2),
          rewardSubsidy: rewardSubsidy.toFixed(2),
        },
        monthlySpending,
        utilization: utilization.map((row) => ({
          ...row,
          remaining: new Prisma.Decimal(row.budgetLimit)
            .minus(row.spent)
            .toFixed(2),
          usagePercent: usagePercent(row.spent, row.budgetLimit),
        })),
      },
      shops: {
        salesBySize,
        topShops: topShops.map((row) => ({
          ...row,
          shopId: row.shopId.toString(),
        })),
        categoryDistribution: categoryDistribution.map((row) => ({
          ...row,
          categoryId: row.categoryId.toString(),
        })),
      },
      customers: {
        summary: customerSummary,
        transactionTrends: monthlySpending.map((row) => ({
          month: row.month,
          transactionCount: row.transactionCount,
          uniqueCustomers: row.uniqueCustomers,
          averageTransaction: row.averageTransaction,
        })),
        repeatAnalysis: {
          firstTransactions: customerSummary.firstTransactions,
          repeatTransactions: customerSummary.repeatTransactions,
          repeatRate:
            customerSummary.transactionCount === 0
              ? 0
              : Number(
                  new Prisma.Decimal(customerSummary.repeatTransactions)
                    .mul(100)
                    .div(customerSummary.transactionCount)
                    .toDecimalPlaces(1)
                    .toString(),
                ),
        },
      },
      coinsAndRewards: { monthly: coinsAndRewards },
      definitions,
      limitations,
      lastUpdatedAt: new Date().toISOString(),
    };
  }
}
