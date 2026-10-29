import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import {
  amountToCents,
  bangkokDayRange,
  bangkokMonth,
  bangkokMonthRange,
  ensureBangkokMonthlyPeriod,
  paymentBreakdown,
  paymentWithReward,
} from './wallets.service.js';

describe('wallet money rules', () => {
  it('parses positive decimal THB amounts as integer satang', () => {
    expect(amountToCents('1')).toBe(100);
    expect(amountToCents('10.05')).toBe(1005);
    expect(() => amountToCents('0')).toThrow();
    expect(() => amountToCents('1.001')).toThrow();
  });

  it('creates a new Bangkok monthly period with the default budget without updating an existing period', async () => {
    const upsert = vi.fn().mockResolvedValue({ period_id: 1n });
    await ensureBangkokMonthlyPeriod(
      {
        monthly_periods: { upsert },
      } as unknown as Prisma.TransactionClient,
      new Date('2026-10-15T00:00:00.000Z'),
    );

    expect(upsert).toHaveBeenCalledWith({
      where: { month_key: new Date('2026-10-01T00:00:00.000Z') },
      create: {
        month_key: new Date('2026-10-01T00:00:00.000Z'),
        starts_at: new Date('2026-09-30T17:00:00.000Z'),
        ends_at: new Date('2026-10-31T17:00:00.000Z'),
        budget_limit: '100000.00',
        status: 'DRAFT',
      },
      update: {},
    });
  });

  it('uses Bangkok calendar months including the UTC boundary', () => {
    expect(bangkokMonth(new Date('2026-09-30T16:59:59.999Z'))).toBe(
      '2026-09-01',
    );
    expect(bangkokMonth(new Date('2026-09-30T17:00:00.000Z'))).toBe(
      '2026-10-01',
    );
    expect(bangkokMonthRange(new Date('2026-10-15T00:00:00Z'))).toEqual({
      month: '2026-10-01',
      startsAt: new Date('2026-09-30T17:00:00.000Z'),
      endsAt: new Date('2026-10-31T17:00:00.000Z'),
    });
  });

  it('uses Bangkok calendar days including the UTC boundary', () => {
    expect(bangkokDayRange(new Date('2026-10-11T16:59:59.999Z'))).toEqual({
      day: '2026-10-11',
      startsAt: new Date('2026-10-10T17:00:00.000Z'),
      endsAt: new Date('2026-10-11T17:00:00.000Z'),
    });
    expect(bangkokDayRange(new Date('2026-10-11T17:00:00.000Z'))).toEqual({
      day: '2026-10-12',
      startsAt: new Date('2026-10-11T17:00:00.000Z'),
      endsAt: new Date('2026-10-12T17:00:00.000Z'),
    });
  });

  it('uses help up to 60 percent and moves any shortage to customer cash', () => {
    expect(paymentBreakdown(10_000, 10_000)).toEqual({
      targetHelp: 6_000,
      help: 6_000,
      cash: 4_000,
    });
    expect(paymentBreakdown(10_000, 2_500)).toEqual({
      targetHelp: 6_000,
      help: 2_500,
      cash: 7_500,
    });
    expect(paymentBreakdown(10_000, 0)).toEqual({
      targetHelp: 6_000,
      help: 0,
      cash: 10_000,
    });
  });

  it('rounds the 60 percent target half-up to one satang', () => {
    expect(paymentBreakdown(1, 1)).toEqual({
      targetHelp: 1,
      help: 1,
      cash: 0,
    });
    expect(paymentBreakdown(2, 2)).toEqual({
      targetHelp: 1,
      help: 1,
      cash: 1,
    });
  });
});

describe('Main Quest payment allocation', () => {
  it('caps reward at the remaining cash share and available reward', () => {
    expect(paymentWithReward(10000, 6000, 10000)).toMatchObject({
      help: 6000,
      reward: 4000,
      cash: 0,
    });
    expect(paymentWithReward(10000, 2500, 1000)).toMatchObject({
      help: 2500,
      reward: 1000,
      cash: 6500,
    });
    expect(paymentWithReward(10000, 0, 0)).toMatchObject({
      help: 0,
      reward: 0,
      cash: 10000,
    });
  });
});
