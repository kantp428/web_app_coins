import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import {
  currentMonthCoins,
  quotePurchaseCoins,
  readSellerCoinRates,
} from './purchase-coins.js';

function fixture(rate: boolean = true, repeat: boolean = false) {
  const tx = {
    shop_coin_rates: {
      findFirst: vi.fn().mockResolvedValue(
        rate
          ? {
              rule_id: 7n,
              new_customer_coins: 10,
              repeat_customer_coins: 1,
              coin_rule_versions: {
                version: 4,
                minimum_purchase: new Prisma.Decimal('50'),
              },
            }
          : null,
      ),
    },
    coin_entries: {
      findFirst: vi
        .fn()
        .mockResolvedValue(repeat ? { coin_entry_id: 1n } : null),
      aggregate: vi.fn().mockResolvedValue({ _sum: { coins: null } }),
    },
  };
  return { tx, client: tx as unknown as Prisma.TransactionClient };
}
const now = new Date('2026-10-13T06:00:00+07:00');
describe('seller shop Coin rates', () => {
  it('limits reads to owned shops/current half-open period and serializes frozen rule', async () => {
    const rate = {
      new_customer_coins: 10,
      repeat_customer_coins: 1,
      coin_rule_versions: {
        minimum_purchase: new Prisma.Decimal('50'),
        version: 4,
      },
      coin_rate_periods: {
        starts_at: now,
        ends_at: new Date(now.getTime() + 43200000),
      },
    };
    const findMany = vi.fn().mockResolvedValue([
      {
        shop_id: 2n,
        name: 'Owned',
        participation_status: 'APPROVED',
        shop_coin_rates: [rate],
      },
      {
        shop_id: 3n,
        name: 'Waiting',
        participation_status: 'APPROVED',
        shop_coin_rates: [],
      },
      {
        shop_id: 4n,
        name: 'Suspended',
        participation_status: 'SUSPENDED',
        shop_coin_rates: [rate],
      },
    ]);
    const result = await readSellerCoinRates(
      { shops: { findMany } } as unknown as Prisma.TransactionClient,
      1n,
      now,
    );
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { owner_id: 1n },
        include: {
          shop_coin_rates: {
            where: {
              coin_rate_periods: {
                starts_at: { lte: now },
                ends_at: { gt: now },
              },
            },
            include: { coin_rate_periods: true, coin_rule_versions: true },
            take: 1,
          },
        },
      }),
    );
    expect(result[0]).toMatchObject({
      shopId: '2',
      rate: {
        minimumPurchase: '50.00',
        newCustomerCoins: 10,
        repeatCustomerCoins: 1,
        ruleVersion: 4,
      },
    });
    expect(result.slice(1).every((shop) => shop.rate === null)).toBe(true);
  });
});
describe('purchase Coins quote', () => {
  it('uses inclusive minimum and frozen half-open rate, not a live rule', async () => {
    const { tx, client } = fixture();
    expect(
      await quotePurchaseCoins(client, 1n, 2n, new Prisma.Decimal('50'), now),
    ).toMatchObject({ coins: 10, coinReason: 'NEW_CUSTOMER', ruleId: 7n });
    expect(tx.shop_coin_rates.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          shop_id: 2n,
          coin_rate_periods: { starts_at: { lte: now }, ends_at: { gt: now } },
        },
      }),
    );
  });
  it('returns zero below minimum without consuming first award', async () => {
    const { tx, client } = fixture();
    expect(
      await quotePurchaseCoins(
        client,
        1n,
        2n,
        new Prisma.Decimal('49.99'),
        now,
      ),
    ).toMatchObject({ coins: 0, coinReason: 'BELOW_MINIMUM' });
    expect(tx.coin_entries.findFirst).not.toHaveBeenCalled();
  });
  it('uses prior awards across months, including reversed entries', async () => {
    const { tx, client } = fixture(true, true);
    expect(
      await quotePurchaseCoins(client, 1n, 2n, new Prisma.Decimal('100'), now),
    ).toMatchObject({ coins: 1, coinReason: 'REPEAT_CUSTOMER' });
    expect(tx.coin_entries.findFirst).toHaveBeenCalledWith({
      where: { user_id: 1n, purchases: { shop_id: 2n } },
      select: { coin_entry_id: true },
    });
  });
  it('returns zero without a frozen shop rate', async () => {
    const { client } = fixture(false);
    expect(
      await quotePurchaseCoins(client, 1n, 2n, new Prisma.Decimal('100'), now),
    ).toEqual({
      coins: 0,
      coinReason: 'NO_RATE',
      ruleId: null,
      coinRuleVersion: null,
    });
  });
  it('reads only current monthly unreversed ledger and returns zero when empty', async () => {
    const { tx, client } = fixture();
    expect(await currentMonthCoins(client, 1n, '2026-10-01')).toBe('0');
    expect(tx.coin_entries.aggregate).toHaveBeenCalledWith({
      where: {
        user_id: 1n,
        reversed_at: null,
        monthly_periods: { month_key: new Date('2026-10-01T00:00:00Z') },
      },
      _sum: { coins: true },
    });
  });
});
