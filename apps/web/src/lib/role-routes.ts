export const customerRoutes: Record<string, string> = {
  home: "/wallet",
  scan: "/wallet/scan",
  topup: "/wallet/top-up",
  explore: "/wallet/explore",
  quest: "/wallet/quests",
  history: "/wallet/history",
  profile: "/wallet/account",
};
export const sellerRoutes: Record<string, string> = {
  home: "/store",
  receive: "/store/receive",
  history: "/store/history",
  manage: "/store/settings",
  profile: "/store/account",
};
export const governmentRoutes = [
  { href: "/government", label: "ภาพรวม" },
  { href: "/government/stores", label: "อนุมัติร้าน" },
  { href: "/government/coin-rules", label: "กติกา Coins" },
  { href: "/government/reports", label: "รายงาน" },
  { href: "/government/account", label: "บัญชี" },
];
