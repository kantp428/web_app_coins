export type ReportFilters = {
  from: string;
  to: string;
  timezone: "Asia/Bangkok";
};

export type MonthlySpending = {
  month: string;
  totalSales: string;
  totalSubsidy?: string;
  baseSubsidy: string;
  rewardSubsidy: string;
  transactionCount?: number;
  uniqueCustomers?: number;
  averageTransaction?: string;
};

export type ShopSizeSales = {
  size: string;
  sales: string;
  transactionCount: number;
};

type ReportMeta = {
  filters: ReportFilters;
  definitions: Record<string, string>;
  limitations: string[];
  lastUpdatedAt: string;
};

export type GovernmentDashboardResponse = ReportMeta & {
  kpis: {
    budgetSpent: string;
    budgetRemaining: string;
    totalSales: string;
    citizensUsingBenefit: number;
    transactingShops: number;
    rewardRecipients: number;
  };
  trends: MonthlySpending[];
  budgetUtilization: {
    budgetLimit: string;
    spent: string;
    remaining: string;
    usagePercent: number;
  };
  salesByShopSize: ShopSizeSales[];
};

export type GovernmentReportsResponse = ReportMeta & {
  budget: {
    subsidySplit: { baseSubsidy: string; rewardSubsidy: string };
    monthlySpending: MonthlySpending[];
    utilization: Array<{
      month: string;
      status: string;
      budgetLimit: string;
      spent: string;
      remaining: string;
      usagePercent: number;
    }>;
  };
  shops: {
    salesBySize: ShopSizeSales[];
    topShops: Array<{
      shopId: string;
      name: string;
      sales: string;
      transactionCount: number;
    }>;
    categoryDistribution: Array<{
      categoryId: string;
      name: string;
      transactingShops: number;
      sales: string;
    }>;
  };
  customers: {
    summary: {
      transactionCount: number;
      uniqueCustomers: number;
      averageTransaction: string;
      firstTransactions: number;
      repeatTransactions: number;
    };
    transactionTrends: Array<{
      month: string;
      transactionCount: number;
      uniqueCustomers: number;
      averageTransaction: string;
    }>;
    repeatAnalysis: {
      firstTransactions: number;
      repeatTransactions: number;
      repeatRate: number;
    };
  };
  coinsAndRewards: {
    monthly: Array<{
      month: string;
      coinsAwarded: string;
      coinAwards: number;
      rewardRecipients: number;
      rewardAllocation: string;
    }>;
  };
};
