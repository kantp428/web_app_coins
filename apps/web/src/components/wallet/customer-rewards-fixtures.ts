export type QuestStatus =
  "COLLECTING" | "REWARDED" | "USED" | "EXPIRED" | "CLOSED";

export type CustomerPurchaseFixture = {
  id: string;
  storeName: string;
  purchasedAt: string;
  totalAmount: number;
  customerPaid: number;
  helpUsed: number;
  questHelpUsed: number;
  coinsEarned: number;
};

export type QuestRewardFixture = {
  id: string;
  grantedAt: string;
  amount: number;
  status: "AVAILABLE" | "USED" | "EXPIRED";
  usedAt?: string;
  expiredAt?: string;
};

export type CustomerMonthFixture = {
  id: string;
  label: string;
  coins: number;
  targetCoins: number;
  rewardAmount: number;
  questStatus: QuestStatus;
  purchases: CustomerPurchaseFixture[];
  rewards: QuestRewardFixture[];
};

export const customerMonthFixtures: CustomerMonthFixture[] = [
  {
    id: "2026-10",
    label: "ตุลาคม 2569",
    coins: 64,
    targetCoins: 100,
    rewardAmount: 100,
    questStatus: "COLLECTING",
    purchases: [
      {
        id: "DEMO-OCT-003",
        storeName: "ครัวป้าเล็ก",
        purchasedAt: "13 ต.ค. 2569 • 12:30",
        totalAmount: 80,
        customerPaid: 40,
        helpUsed: 40,
        questHelpUsed: 0,
        coinsEarned: 10,
      },
      {
        id: "DEMO-OCT-002",
        storeName: "ละมุนคอฟฟี่",
        purchasedAt: "9 ต.ค. 2569 • 09:15",
        totalAmount: 60,
        customerPaid: 30,
        helpUsed: 30,
        questHelpUsed: 0,
        coinsEarned: 8,
      },
      {
        id: "DEMO-OCT-001",
        storeName: "ร้านชุมชนของชำ",
        purchasedAt: "4 ต.ค. 2569 • 17:42",
        totalAmount: 120,
        customerPaid: 60,
        helpUsed: 60,
        questHelpUsed: 0,
        coinsEarned: 9,
      },
    ],
    rewards: [],
  },
  {
    id: "2026-09",
    label: "กันยายน 2569",
    coins: 100,
    targetCoins: 100,
    rewardAmount: 100,
    questStatus: "EXPIRED",
    purchases: [
      {
        id: "DEMO-SEP-002",
        storeName: "บ้านขนมไทย",
        purchasedAt: "24 ก.ย. 2569 • 15:20",
        totalAmount: 150,
        customerPaid: 75,
        helpUsed: 75,
        questHelpUsed: 0,
        coinsEarned: 10,
      },
      {
        id: "DEMO-SEP-001",
        storeName: "ตลาดผักชุมชน",
        purchasedAt: "5 ก.ย. 2569 • 10:05",
        totalAmount: 200,
        customerPaid: 100,
        helpUsed: 100,
        questHelpUsed: 0,
        coinsEarned: 8,
      },
    ],
    rewards: [
      {
        id: "DEMO-REWARD-SEP",
        grantedAt: "28 ก.ย. 2569 • 18:10",
        amount: 100,
        status: "EXPIRED",
        expiredAt: "1 ต.ค. 2569 • 00:00",
      },
    ],
  },
  {
    id: "2026-08",
    label: "สิงหาคม 2569",
    coins: 100,
    targetCoins: 100,
    rewardAmount: 100,
    questStatus: "USED",
    purchases: [
      {
        id: "DEMO-AUG-001",
        storeName: "ครัวชุมชนสุขใจ",
        purchasedAt: "22 ส.ค. 2569 • 11:45",
        totalAmount: 240,
        customerPaid: 20,
        helpUsed: 120,
        questHelpUsed: 100,
        coinsEarned: 10,
      },
    ],
    rewards: [
      {
        id: "DEMO-REWARD-AUG",
        grantedAt: "18 ส.ค. 2569 • 16:30",
        amount: 100,
        status: "USED",
        usedAt: "22 ส.ค. 2569 • 11:45",
      },
    ],
  },
  {
    id: "2026-07",
    label: "กรกฎาคม 2569",
    coins: 0,
    targetCoins: 100,
    rewardAmount: 100,
    questStatus: "CLOSED",
    purchases: [],
    rewards: [],
  },
];
