import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { pathToFileURL } from 'node:url';
export async function seedCurrentRule(db) {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Demo seed cannot run in production');
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(726031)`;
    const now = new Date();
    const active = await tx.coin_rule_versions.findFirst({
      where: {
        effective_from: { lte: now },
        OR: [{ effective_to: null }, { effective_to: { gt: now } }],
      },
      orderBy: { version: 'desc' },
    });
    if (active) return { version: active.version, status: 'existing' };
    const pending = await tx.coin_rule_versions.findFirst({
      where: { effective_from: { gt: now } },
    });
    if (pending) throw new Error('Pending rule exists; no rules changed');
    const officer = await tx.users.findUnique({
      where: { login_identifier: 'demo_government' },
    });
    if (
      !officer ||
      officer.role !== 'GOVERNMENT' ||
      officer.status !== 'ACTIVE'
    )
      throw new Error('ACTIVE demo_government account required; run seed:demo');
    const latest = await tx.coin_rule_versions.findFirst({
      orderBy: { version: 'desc' },
    });
    // Current half-day Bangkok cutoff (06:00/18:00).
    const day = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    const cutoff = [day - 3600000, day + 11 * 3600000, day + 23 * 3600000]
      .filter((t) => t <= now.getTime())
      .at(-1);
    const starts = new Date(
      Math.max(cutoff, latest?.effective_to?.getTime() ?? 0),
    );
    const rule = await tx.coin_rule_versions.create({
      data: {
        version: (latest?.version ?? 0) + 1,
        created_by: officer.user_id,
        creator_role: 'GOVERNMENT',
        effective_from: starts,
        minimum_purchase: '50.00',
        low_sales_threshold: '10000.00',
        sales_window_days: 7,
        repeat_coins: 1,
        new_low_sales_coins: 10,
        new_other_coins: 5,
      },
    });
    return {
      version: rule.version,
      status: 'created',
      effectiveFrom: rule.effective_from,
    };
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    console.log(JSON.stringify(await seedCurrentRule(db)));
  } finally {
    await db.$disconnect();
  }
}
