import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { sqlTable } from '../prisma/sql-table.js';
import { currentMonthCoins } from './purchase-coins.js';

export function questMonths(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === 'year')!.value);
  const month = Number(parts.find((p) => p.type === 'month')!.value);
  return Array.from({ length: 12 }, (_, i) =>
    new Date(Date.UTC(year, month - 1 - i, 1)).toISOString().slice(0, 7),
  );
}

export async function availableQuestReward(
  tx: Prisma.TransactionClient,
  userId: bigint,
  now: Date,
) {
  const grant = await tx.reward_grants.findFirst({
    where: {
      user_id: userId,
      granted_at: { lte: now },
      expires_at: { gt: now },
      monthly_periods: { starts_at: { lte: now }, ends_at: { gt: now } },
    },
  });
  if (!grant) return null;
  const ledger = await tx.money_entries.aggregate({
    where: { grant_id: grant.grant_id },
    _sum: { signed_amount: true },
  });
  return {
    grant,
    available: Prisma.Decimal.max(ledger._sum.signed_amount ?? 0, 0),
  };
}

export async function ensureQuestGrant(
  tx: Prisma.TransactionClient,
  userId: bigint,
  now: Date,
  schema = 'public',
) {
  const month = `${questMonths(now)[0]}-01`;
  await tx.$queryRaw`SELECT period_id FROM ${sqlTable('monthly_periods', schema)} WHERE month_key=${month}::date FOR UPDATE`;
  const period = await tx.monthly_periods.findUnique({
    where: { month_key: new Date(`${month}T00:00:00Z`) },
  });
  if (
    !period ||
    period.status !== 'OPEN' ||
    now < period.starts_at ||
    now >= period.ends_at
  )
    return;
  const existing = await tx.reward_grants.findUnique({
    where: {
      user_id_period_id: { user_id: userId, period_id: period.period_id },
    },
  });
  if (existing) return;
  const coins = await currentMonthCoins(tx, userId, month);
  if (BigInt(coins) < BigInt(period.coin_target)) return;
  const allocated = await tx.reward_grants.aggregate({
    where: { period_id: period.period_id },
    _sum: { amount: true },
  });
  if (
    period.budget_limit
      .minus(allocated._sum.amount ?? 0)
      .lt(period.reward_amount)
  )
    return;
  const wallet = await tx.wallets.upsert({
    where: { user_id_wallet_type: { user_id: userId, wallet_type: 'REWARD' } },
    create: { user_id: userId, user_role: 'CUSTOMER', wallet_type: 'REWARD' },
    update: {},
  });
  const grant = await tx.reward_grants.create({
    data: {
      user_id: userId,
      period_id: period.period_id,
      amount: period.reward_amount,
      granted_at: now,
      expires_at: period.ends_at,
    },
  });
  await tx.money_entries.create({
    data: {
      idempotency_key: `quest:${userId}:${period.period_id}`,
      user_id: userId,
      wallet_id: wallet.wallet_id,
      wallet_type: 'REWARD',
      grant_id: grant.grant_id,
      signed_amount: grant.amount,
      entry_type: 'REWARD_ALLOCATION',
      created_at: now,
    },
  });
}

export async function readMainQuest(
  tx: Prisma.TransactionClient,
  userId: bigint,
  requestedMonth: unknown,
  now: Date,
) {
  const months = questMonths(now);
  const month = requestedMonth ?? months[0];
  if (typeof month !== 'string' || !months.includes(month))
    throw new BadRequestException('เลือกรอบเดือนจาก 12 เดือนล่าสุด');
  const period = await tx.monthly_periods.findUnique({
    where: { month_key: new Date(`${month}-01T00:00:00Z`) },
  });
  const coins = await currentMonthCoins(tx, userId, `${month}-01`);
  const grant = period
    ? await tx.reward_grants.findUnique({
        where: {
          user_id_period_id: { user_id: userId, period_id: period.period_id },
        },
      })
    : null;
  let reward = null;
  if (grant) {
    const ledger = await tx.money_entries.aggregate({
      where: { grant_id: grant.grant_id },
      _sum: { signed_amount: true },
    });
    const remaining = Prisma.Decimal.max(ledger._sum.signed_amount ?? 0, 0);
    const expired = now >= grant.expires_at;
    reward = {
      amount: grant.amount.toFixed(2),
      used: Prisma.Decimal.max(grant.amount.minus(remaining), 0).toFixed(2),
      available: expired ? '0.00' : remaining.toFixed(2),
      expired: expired ? remaining.toFixed(2) : '0.00',
      grantedAt: grant.granted_at.toISOString(),
      expiresAt: grant.expires_at.toISOString(),
    };
  }
  const current = month === months[0];
  const status = reward
    ? now >= new Date(reward.expiresAt)
      ? 'EXPIRED'
      : reward.available === '0.00'
        ? 'USED'
        : 'AVAILABLE'
    : !current
      ? 'ENDED'
      : BigInt(coins) >= 100n
        ? 'WAITING_BUDGET'
        : 'IN_PROGRESS';
  return {
    month,
    months,
    coins,
    target: 100,
    rewardAmount: '100.00',
    remainingCoins: Number(BigInt(coins) >= 100n ? 0n : 100n - BigInt(coins)),
    status,
    canClaim: current && !grant && BigInt(coins) >= 100n,
    reward,
  };
}
