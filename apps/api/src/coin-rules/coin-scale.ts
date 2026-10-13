import { Prisma } from '@prisma/client';

export function scaledNewCustomerCoins(
  sales: Prisma.Decimal,
  threshold: Prisma.Decimal,
  maximum: number,
  minimum: number,
) {
  if (threshold.lte(0)) return minimum;
  const cappedSales = Prisma.Decimal.min(
    Prisma.Decimal.max(sales, 0),
    threshold,
  );
  return new Prisma.Decimal(maximum)
    .minus(cappedSales.mul(maximum - minimum).div(threshold))
    .ceil()
    .toNumber();
}

export function ruleScaleDetail(rule: {
  low_sales_threshold: Prisma.Decimal;
  sales_window_days: number;
  new_low_sales_coins: number;
  new_other_coins: number;
}) {
  const threshold = rule.low_sales_threshold;
  const maximum = rule.new_low_sales_coins;
  const minimum = rule.new_other_coins;
  const thresholdLabel = threshold
    .toNumber()
    .toLocaleString('en-US', { maximumFractionDigits: 2 });
  const salesPoints = [
    ...new Set(
      [0, 1, 2, 3, 4].map((step) =>
        threshold
          .mul(step)
          .div(4)
          .toDecimalPlaces(2, Prisma.Decimal.ROUND_FLOOR)
          .toFixed(2),
      ),
    ),
  ];
  return {
    formula: threshold.lte(0)
      ? `Coins = ${minimum} (เกณฑ์ยอดขาย 0 บาท)`
      : `Coins = ceil(${maximum} − ${maximum - minimum} × min(ยอดขายย้อนหลัง ${rule.sales_window_days} วัน ÷ ${thresholdLabel}, 1))`,
    examples: salesPoints.map((sales) => ({
      sales,
      coins: scaledNewCustomerCoins(
        new Prisma.Decimal(sales),
        threshold,
        maximum,
        minimum,
      ),
    })),
  };
}
