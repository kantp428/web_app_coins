import { Prisma } from '@prisma/client';

export async function readSellerCoinRates(
  tx: Prisma.TransactionClient,
  sellerId: bigint,
  now: Date,
) {
  const shops = await tx.shops.findMany({
    where: { owner_id: sellerId },
    orderBy: { shop_id: 'asc' },
    include: {
      shop_coin_rates: {
        where: {
          coin_rate_periods: { starts_at: { lte: now }, ends_at: { gt: now } },
        },
        include: { coin_rate_periods: true, coin_rule_versions: true },
        take: 1,
      },
    },
  });
  return shops.map((shop) => {
    const rate =
      shop.participation_status === 'APPROVED'
        ? shop.shop_coin_rates[0]
        : undefined;
    return {
      shopId: shop.shop_id.toString(),
      name: shop.name,
      status: shop.participation_status,
      rate: rate
        ? {
            minimumPurchase:
              rate.coin_rule_versions.minimum_purchase.toFixed(2),
            newCustomerCoins: rate.new_customer_coins,
            repeatCustomerCoins: rate.repeat_customer_coins,
            ruleVersion: rate.coin_rule_versions.version,
            startsAt: rate.coin_rate_periods.starts_at.toISOString(),
            endsAt: rate.coin_rate_periods.ends_at.toISOString(),
          }
        : null,
    };
  });
}

export async function quotePurchaseCoins(
  tx: Prisma.TransactionClient,
  customerId: bigint,
  shopId: bigint,
  amount: Prisma.Decimal,
  now: Date,
) {
  const rate = await tx.shop_coin_rates.findFirst({
    where: {
      shop_id: shopId,
      coin_rate_periods: {
        starts_at: { lte: now },
        ends_at: { gt: now },
      },
    },
    include: { coin_rule_versions: true },
  });
  if (!rate)
    return {
      coins: 0,
      coinReason: 'NO_RATE',
      coinRuleVersion: null,
      ruleId: null,
    };
  const rule = rate.coin_rule_versions;
  if (amount.lt(rule.minimum_purchase))
    return {
      coins: 0,
      coinReason: 'BELOW_MINIMUM',
      coinRuleVersion: rule.version,
      ruleId: rate.rule_id,
    };
  const priorAward = await tx.coin_entries.findFirst({
    where: { user_id: customerId, purchases: { shop_id: shopId } },
    select: { coin_entry_id: true },
  });
  return {
    coins: priorAward ? rate.repeat_customer_coins : rate.new_customer_coins,
    coinReason: priorAward ? 'REPEAT_CUSTOMER' : 'NEW_CUSTOMER',
    coinRuleVersion: rule.version,
    ruleId: rate.rule_id,
  };
}

export async function currentMonthCoins(
  tx: Prisma.TransactionClient,
  customerId: bigint,
  month: string,
) {
  const result = await tx.coin_entries.aggregate({
    where: {
      user_id: customerId,
      reversed_at: null,
      monthly_periods: { month_key: new Date(`${month}T00:00:00Z`) },
    },
    _sum: { coins: true },
  });
  return String(result._sum.coins ?? 0);
}
