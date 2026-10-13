import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CoinRatesService,
  currentRatePeriod,
  scaledNewCustomerCoins,
} from './coin-rates.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { AuthService } from '../auth/auth.service.js';

const now = new Date('2026-10-13T08:00:00+07:00');
const start = new Date('2026-10-13T06:00:00+07:00');
const rule = {
  rule_id: 4n,
  sales_window_days: 7,
  low_sales_threshold: new Prisma.Decimal('10000'),
  new_low_sales_coins: 10,
  new_other_coins: 5,
  repeat_coins: 1,
};
function fixture(config: Record<string, string> = {}, role = 'GOVERNMENT') {
  const tx = {
    $executeRaw: vi.fn().mockResolvedValue(0),
    coin_rate_periods: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ period_id: 9n }),
    },
    coin_rule_versions: { findFirst: vi.fn().mockResolvedValue(rule) },
    shops: {
      findMany: vi
        .fn()
        .mockResolvedValue([{ shop_id: 1n }, { shop_id: 2n }, { shop_id: 3n }]),
    },
    purchases: {
      groupBy: vi.fn().mockResolvedValue([
        { shop_id: 1n, _sum: { total_amount: new Prisma.Decimal('9999.99') } },
        { shop_id: 2n, _sum: { total_amount: new Prisma.Decimal('10000.00') } },
      ]),
    },
    shop_coin_rates: { createMany: vi.fn().mockResolvedValue({ count: 3 }) },
  };
  const db = {
    $transaction: vi.fn((fn: (value: typeof tx) => unknown) => fn(tx)),
  };
  const auth = { me: vi.fn().mockResolvedValue({ id: '1', role }) };
  const service = new CoinRatesService(
    db as unknown as PrismaService,
    auth as unknown as AuthService,
    new ConfigService(config),
  );
  return { service, tx, db, auth };
}

describe('shop Coin rate generation', () => {
  let warnings: unknown[][];
  beforeEach(() => {
    warnings = [];
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(
      (...args: unknown[]) => {
        warnings.push(args);
      },
    );
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('selects half-open Bangkok periods at 06/18, midnight and month boundaries', () => {
    for (const [input, expected] of [
      ['2026-10-13T05:59:59+07:00', '2026-10-12T18:00:00+07:00'],
      ['2026-10-13T06:00:00+07:00', '2026-10-13T06:00:00+07:00'],
      ['2026-10-13T18:00:00+07:00', '2026-10-13T18:00:00+07:00'],
      ['2026-11-01T00:00:00+07:00', '2026-10-31T18:00:00+07:00'],
    ]) {
      const period = currentRatePeriod(new Date(input));
      expect(period.startsAt).toEqual(new Date(expected));
      expect(period.endsAt.getTime() - period.startsAt.getTime()).toBe(
        43200000,
      );
    }
  });

  it('freezes Decimal threshold, zero sales, rule and lookback snapshots', async () => {
    const { service, tx } = fixture();
    expect(await service.generateCurrent(now)).toMatchObject({
      created: true,
      shopCount: 3,
      periodId: '9',
    });
    const rows = tx.shop_coin_rates.createMany.mock.calls[0][0].data;
    expect(
      rows.map((row: { new_customer_coins: number }) => row.new_customer_coins),
    ).toEqual([6, 5, 10]);
    expect(rows[2].sales_total_snapshot.toString()).toBe('0');
    expect(rows[0]).toMatchObject({
      rule_id: 4n,
      repeat_customer_coins: 1,
      sales_window_starts_at: new Date('2026-10-06T06:00:00+07:00'),
      sales_window_ends_at: start,
    });
    expect(tx.shops.findMany.mock.calls[0][0].where).toEqual({
      participation_status: 'APPROVED',
    });
    expect(tx.purchases.groupBy.mock.calls[0][0].where).toEqual({
      confirmed_at: { gte: new Date('2026-10-06T06:00:00+07:00'), lt: start },
      OR: [
        { status: 'SUCCEEDED' },
        { status: 'REFUNDED', refunded_at: { gte: start } },
      ],
    });
    expect(tx.coin_rule_versions.findFirst.mock.calls[0][0].where).toEqual({
      effective_from: { lte: start },
      OR: [{ effective_to: null }, { effective_to: { gt: start } }],
    });
  });

  it('uses ordinary rate for zero sales when the threshold is zero', async () => {
    const { service, tx } = fixture();
    tx.coin_rule_versions.findFirst.mockResolvedValue({
      ...rule,
      low_sales_threshold: new Prisma.Decimal(0),
    });
    await service.generateCurrent(now);
    expect(
      tx.shop_coin_rates.createMany.mock.calls[0][0].data[2].new_customer_coins,
    ).toBe(5);
  });

  it('reuses an existing period without recalculating or adding shops', async () => {
    const { service, tx } = fixture();
    tx.coin_rate_periods.findUnique.mockResolvedValue({
      period_id: 9n,
      ends_at: currentRatePeriod(now).endsAt,
      _count: { shop_coin_rates: 2 },
    });
    expect(await service.generateCurrent(now)).toMatchObject({
      created: false,
      shopCount: 2,
    });
    expect(tx.coin_rule_versions.findFirst).not.toHaveBeenCalled();
    expect(tx.shop_coin_rates.createMany).not.toHaveBeenCalled();
  });

  it('rejects overlaps and missing effective rules without writes', async () => {
    const { service, tx } = fixture();
    tx.coin_rate_periods.findFirst.mockResolvedValue({ period_id: 8n });
    await expect(service.generateCurrent(now)).rejects.toMatchObject({
      status: 409,
    });
    tx.coin_rate_periods.findFirst.mockResolvedValue(null);
    tx.coin_rule_versions.findFirst.mockResolvedValue(null);
    await expect(service.generateCurrent(now)).rejects.toMatchObject({
      status: 409,
    });
    expect(tx.coin_rate_periods.create).not.toHaveBeenCalled();
  });

  it('creates an empty frozen period when no approved shops exist', async () => {
    const { service, tx } = fixture();
    tx.shops.findMany.mockResolvedValue([]);
    expect(await service.generateCurrent(now)).toMatchObject({
      created: true,
      shopCount: 0,
    });
    expect(tx.shop_coin_rates.createMany).not.toHaveBeenCalled();
  });

  it('checks government, production and body before starting transactions', async () => {
    for (const role of ['CUSTOMER', 'SELLER']) {
      const { service, db } = fixture({}, role);
      await expect(service.generateManual({})).rejects.toMatchObject({
        status: 403,
      });
      expect(db.$transaction).not.toHaveBeenCalled();
    }
    const prod = fixture({ NODE_ENV: 'production' });
    await expect(prod.service.generateManual({})).rejects.toMatchObject({
      status: 403,
    });
    expect(prod.db.$transaction).not.toHaveBeenCalled();
    const { service, db, auth } = fixture();
    for (const body of [undefined, null, [], { startsAt: now }, { rate: 10 }])
      await expect(service.generateManual(body)).rejects.toMatchObject({
        status: 400,
      });
    expect(db.$transaction).not.toHaveBeenCalled();
    auth.me.mockRejectedValueOnce({ status: 401 });
    await expect(service.generateManual({})).rejects.toMatchObject({
      status: 401,
    });
  });

  it('manual generation works when automatic generation is disabled', async () => {
    const { service } = fixture({ ENABLE_AUTO_COIN_RATES: 'false' });
    const generate = vi.spyOn(service, 'generateCurrent').mockResolvedValue({
      periodId: '9',
      startsAt: '',
      endsAt: '',
      created: false,
      shopCount: 3,
    });
    await service.generateManual({});
    expect(generate).toHaveBeenCalledOnce();
  });

  it('starts immediately, polls, and clears its timer on shutdown', async () => {
    vi.useFakeTimers();
    const { service } = fixture();
    const worker = vi
      .spyOn(service, 'runAutomatic')
      .mockResolvedValue(undefined);
    service.onApplicationBootstrap();
    expect(worker).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60000);
    expect(worker).toHaveBeenCalledTimes(2);
    service.onModuleDestroy();
    await vi.advanceTimersByTimeAsync(60000);
    expect(worker).toHaveBeenCalledTimes(2);
    const off = fixture({ ENABLE_AUTO_COIN_RATES: 'false' });
    const offWorker = vi
      .spyOn(off.service, 'runAutomatic')
      .mockResolvedValue(undefined);
    off.service.onApplicationBootstrap();
    expect(offWorker).not.toHaveBeenCalled();
  });

  it('skips overlapping local ticks and retries safely after failures', async () => {
    const { service } = fixture();
    const deferred =
      Promise.withResolvers<
        Awaited<ReturnType<CoinRatesService['generateCurrent']>>
      >();
    const generate = vi
      .spyOn(service, 'generateCurrent')
      .mockReturnValueOnce(deferred.promise);
    const first = service.runAutomatic();
    await service.runAutomatic();
    expect(generate).toHaveBeenCalledOnce();
    deferred.reject(new Error('private database details'));
    await first;
    expect(warnings).toContainEqual([
      'Coin rate generation failed; retrying next minute',
    ]);
    await service.runAutomatic();
    expect(generate).toHaveBeenCalledTimes(2);
  });
});

describe('linear new-customer Coins', () => {
  it.each([
    ['0', 10],
    ['1000', 10],
    ['2000', 9],
    ['2000.01', 9],
    ['1999.99', 10],
    ['2500', 9],
    ['5000', 8],
    ['6000', 7],
    ['7500', 7],
    ['9000', 6],
    ['9999.99', 6],
    ['10000', 5],
    ['10000.01', 5],
    ['999999999999.99', 5],
    ['-1', 10],
  ])('rounds up and clamps sales %s to %i Coins', (sales, expected) => {
    expect(
      scaledNewCustomerCoins(
        new Prisma.Decimal(sales),
        new Prisma.Decimal('10000'),
        10,
        5,
      ),
    ).toBe(expected);
  });
  it('uses configured endpoints, decimal thresholds, equal endpoints and zero threshold', () => {
    expect(
      scaledNewCustomerCoins(
        new Prisma.Decimal('25.05'),
        new Prisma.Decimal('100.20'),
        8,
        2,
      ),
    ).toBe(7);
    expect(
      scaledNewCustomerCoins(
        new Prisma.Decimal('5000'),
        new Prisma.Decimal('10000'),
        8,
        8,
      ),
    ).toBe(8);
    expect(
      scaledNewCustomerCoins(
        new Prisma.Decimal('0'),
        new Prisma.Decimal('0'),
        10,
        5,
      ),
    ).toBe(5);
  });
});
