import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { pathToFileURL } from 'node:url';

export const historicalRules = [
  {
    version: 1,
    effective_from: new Date('2026-09-01T06:00:00+07:00'),
    effective_to: new Date('2026-09-15T06:00:00+07:00'),
    minimum_purchase: '20.00',
    low_sales_threshold: '5000.00',
    sales_window_days: 7,
    repeat_coins: 1,
    new_low_sales_coins: 8,
    new_other_coins: 3,
  },
  {
    version: 2,
    effective_from: new Date('2026-09-15T06:00:00+07:00'),
    effective_to: new Date('2026-09-22T06:00:00+07:00'),
    minimum_purchase: '30.00',
    low_sales_threshold: '8000.00',
    sales_window_days: 7,
    repeat_coins: 1,
    new_low_sales_coins: 9,
    new_other_coins: 4,
  },
  {
    version: 3,
    effective_from: new Date('2026-09-22T06:00:00+07:00'),
    effective_to: new Date('2026-10-01T06:00:00+07:00'),
    minimum_purchase: '50.00',
    low_sales_threshold: '10000.00',
    sales_window_days: 14,
    repeat_coins: 1,
    new_low_sales_coins: 10,
    new_other_coins: 5,
  },
];
export async function seedHistoricalRules(db) {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Historical demo seed cannot run in production');
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(726031)`;
    const officer = await tx.users.findUnique({
      where: { login_identifier: 'demo_government' },
    });
    if (
      !officer ||
      officer.role !== 'GOVERNMENT' ||
      officer.status !== 'ACTIVE'
    )
      throw new Error(
        'Run seed:demo first; an ACTIVE demo_government account is required',
      );
    const results = [];
    for (const rule of historicalRules) {
      if (rule.effective_to >= new Date())
        throw new Error('Seed only supports expired rules');
      const existing = await tx.coin_rule_versions.findUnique({
        where: { version: rule.version },
      });
      if (existing) {
        const equal =
          existing.created_by === officer.user_id &&
          Object.entries(rule).every(([key, value]) =>
            value instanceof Date
              ? existing[key].getTime() === value.getTime()
              : key === 'minimum_purchase' || key === 'low_sales_threshold'
                ? existing[key].equals(value)
                : existing[key] === value,
          );
        if (!equal)
          throw new Error(
            `Version ${rule.version} already belongs to another rule; no rules changed`,
          );
        results.push({ version: rule.version, status: 'existing' });
        continue;
      }
      const overlapping = await tx.coin_rule_versions.findFirst({
        where: {
          effective_from: { lt: rule.effective_to },
          OR: [
            { effective_to: null },
            { effective_to: { gt: rule.effective_from } },
          ],
        },
      });
      if (overlapping)
        throw new Error(
          'Historical window overlaps an existing rule; no rules changed',
        );
      await tx.coin_rule_versions.create({
        data: {
          ...rule,
          created_by: officer.user_id,
          creator_role: 'GOVERNMENT',
          created_at: rule.effective_from,
        },
      });
      results.push({ version: rule.version, status: 'created' });
    }
    return results;
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    console.log(JSON.stringify(await seedHistoricalRules(db)));
  } finally {
    await db.$disconnect();
  }
}
