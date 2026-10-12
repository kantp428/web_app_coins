import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service.js';
const { tx } = vi.hoisted(() => ({
  tx: {
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
    coin_rule_versions: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    coin_rate_periods: { findMany: vi.fn() },
  },
}));
vi.mock('@prisma/client', async (importOriginal) => ({
  Prisma: (await importOriginal<typeof import('@prisma/client')>()).Prisma,
  PrismaClient: class {
    coin_rule_versions = tx.coin_rule_versions;
    coin_rate_periods = tx.coin_rate_periods;
    $queryRaw = tx.$queryRaw;
    $transaction = vi.fn((cb: (v: unknown) => unknown) => cb(tx));
    $disconnect = vi.fn();
  },
}));
import {
  CoinRulesService,
  validRule,
  nextCutoff,
} from './coin-rules.service.js';
const body = {
  minimumPurchase: '50.00',
  lowSalesThreshold: '10000.00',
  salesWindowDays: 7,
  repeatCoins: 1,
  newLowSalesCoins: 10,
  newOtherCoins: 5,
};
describe('Coin rules', () => {
  beforeEach(() => vi.resetAllMocks());
  it('validates decimal strings and DB rule bounds', () => {
    expect(validRule(body)).toBe(true);
    for (const change of [
      { minimumPurchase: '0' },
      { minimumPurchase: 50 },
      { minimumPurchase: '1e3' },
      { minimumPurchase: '1.001' },
      { lowSalesThreshold: '-1' },
      { repeatCoins: 2 },
      { newLowSalesCoins: 7 },
      { newOtherCoins: 11 },
      { salesWindowDays: 0 },
      { salesWindowDays: 1.5 },
      { extra: true },
    ])
      expect(validRule({ ...body, ...change })).toBe(false);
  });
  it('uses strictly next Bangkok cutoff at boundaries and across midnight', () => {
    expect(
      nextCutoff(new Date('2026-10-12T05:59:59+07:00')).toISOString(),
    ).toBe('2026-10-11T23:00:00.000Z');
    expect(
      nextCutoff(new Date('2026-10-12T06:00:00+07:00')).toISOString(),
    ).toBe('2026-10-12T11:00:00.000Z');
    expect(
      nextCutoff(new Date('2026-10-12T18:00:00+07:00')).toISOString(),
    ).toBe('2026-10-12T23:00:00.000Z');
  });
  function service(role = 'GOVERNMENT') {
    return new CoinRulesService(new ConfigService(), {
      me: vi.fn().mockResolvedValue({ id: '1', role }),
    } as unknown as AuthService);
  }
  it('rejects customer/seller read and write', async () => {
    for (const role of ['CUSTOMER', 'SELLER']) {
      await expect(service(role).list('Bearer test')).rejects.toMatchObject({
        status: 403,
      });
      await expect(
        service(role).create(body, 'Bearer test'),
      ).rejects.toMatchObject({ status: 403 });
    }
    expect(tx.$executeRaw).not.toHaveBeenCalled();
  });
  it('propagates unauthenticated errors', async () => {
    const auth = { me: vi.fn().mockRejectedValue({ status: 401 }) };
    await expect(
      new CoinRulesService(
        new ConfigService(),
        auth as unknown as AuthService,
      ).list(),
    ).rejects.toMatchObject({ status: 401 });
  });
  it('creates first version under transaction lock with server actor', async () => {
    tx.coin_rule_versions.findFirst.mockResolvedValue(null);
    tx.coin_rule_versions.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...data, rule_id: 1n }),
    );
    const result = await service().create(body);
    expect(result).toMatchObject({
      rule_id: '1',
      version: 1,
      created_by: '1',
      repeat_coins: 1,
    });
    expect(tx.$executeRaw).toHaveBeenCalledOnce();
  });
  it('closes old effective interval but does not rewrite its values', async () => {
    tx.coin_rule_versions.findFirst.mockResolvedValue({
      rule_id: 3n,
      version: 3,
      effective_from: new Date(0),
      effective_to: null,
    });
    tx.coin_rule_versions.create.mockResolvedValue({ rule_id: 4n, version: 4 });
    await service().create(body);
    expect(tx.coin_rule_versions.update).toHaveBeenCalledWith({
      where: { rule_id: 3n },
      data: { effective_to: expect.any(Date) },
    });
    expect(tx.coin_rule_versions.create.mock.calls[0][0].data.version).toBe(4);
  });
  it('rejects a second pending rule', async () => {
    tx.coin_rule_versions.findFirst.mockResolvedValue({
      effective_from: new Date(Date.now() + 86400000),
    });
    await expect(service().create(body)).rejects.toMatchObject({ status: 409 });
    expect(tx.coin_rule_versions.create).not.toHaveBeenCalled();
  });
  it('rejects invalid input before DB writes', async () => {
    await expect(
      service().create({ ...body, repeatCoins: 2 }),
    ).rejects.toMatchObject({ status: 400 });
    expect(tx.$executeRaw).not.toHaveBeenCalled();
  });
  it('serializes IDs and returns server round summaries without shop details', async () => {
    tx.coin_rule_versions.findMany.mockResolvedValue([{ rule_id: 1n }]);
    tx.$queryRaw.mockResolvedValue([
      {
        period_id: 1n,
        shopCount: 103,
        belowThresholdShopCount: 102,
        atOrAboveThresholdShopCount: 1,
        coinsAwarded: '25',
      },
    ]);
    expect(await service().list()).toMatchObject({
      rules: [{ rule_id: '1' }],
      periods: [
        {
          period_id: '1',
          shopCount: 103,
          belowThresholdShopCount: 102,
          atOrAboveThresholdShopCount: 1,
          coinsAwarded: '25',
        },
      ],
    });
  });
});
