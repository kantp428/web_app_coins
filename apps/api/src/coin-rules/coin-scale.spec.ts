import { describe, expect, it } from 'vitest';
import { Prisma } from '@prisma/client';
import { ruleScaleDetail } from './coin-scale.js';

const rule = {
  low_sales_threshold: new Prisma.Decimal('10000'),
  sales_window_days: 7,
  new_low_sales_coins: 10,
  new_other_coins: 5,
};

describe('rule history scale details', () => {
  it('uses the rule endpoints and window to describe server-calculated examples', () => {
    expect(ruleScaleDetail(rule)).toEqual({
      formula: 'Coins = ceil(10 − 5 × min(ยอดขายย้อนหลัง 7 วัน ÷ 10,000, 1))',
      examples: [
        { sales: '0.00', coins: 10 },
        { sales: '2500.00', coins: 9 },
        { sales: '5000.00', coins: 8 },
        { sales: '7500.00', coins: 7 },
        { sales: '10000.00', coins: 5 },
      ],
    });
  });
  it('shows zero threshold without division and deduplicates sub-satang samples', () => {
    expect(
      ruleScaleDetail({ ...rule, low_sales_threshold: new Prisma.Decimal(0) }),
    ).toEqual({
      formula: 'Coins = 5 (เกณฑ์ยอดขาย 0 บาท)',
      examples: [{ sales: '0.00', coins: 5 }],
    });
    expect(
      ruleScaleDetail({
        ...rule,
        low_sales_threshold: new Prisma.Decimal('0.01'),
      }).examples,
    ).toEqual([
      { sales: '0.00', coins: 10 },
      { sales: '0.01', coins: 5 },
    ]);
  });
});
