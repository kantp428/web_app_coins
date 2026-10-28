"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Coins,
  Gift,
  History,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  customerMonthFixtures,
  type CustomerMonthFixture,
  type QuestStatus,
} from "./customer-rewards-fixtures";

const questStatusContent: Record<
  QuestStatus,
  { label: string; description: string; variant: "outline" | "secondary" }
> = {
  COLLECTING: {
    label: "กำลังสะสม",
    description: "สะสม Coins จากรายการซื้อที่เข้าเงื่อนไขให้ครบเป้าหมาย",
    variant: "outline",
  },
  REWARDED: {
    label: "รับสิทธิ์แล้ว",
    description: "วงเงิน Main Quest พร้อมใช้ภายในเดือนที่ได้รับ",
    variant: "secondary",
  },
  USED: {
    label: "ใช้สิทธิ์แล้ว",
    description: "ใช้วงเงิน Main Quest ของรอบนี้เรียบร้อยแล้ว",
    variant: "secondary",
  },
  EXPIRED: {
    label: "หมดอายุ",
    description: "สิทธิ์ใช้ได้เฉพาะเดือนที่ได้รับและไม่สามารถยกไปเดือนถัดไป",
    variant: "outline",
  },
  CLOSED: {
    label: "จบรอบแล้ว",
    description: "รอบเดือนนี้สิ้นสุดแล้วและไม่สามารถสะสม Coins ย้อนหลังได้",
    variant: "outline",
  },
};

function formatBaht(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(value);
}

function MonthSelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue ?? value)}
    >
      <SelectTrigger className="h-10 w-full sm:w-52" aria-label="เลือกรอบเดือน">
        <CalendarDays className="size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {customerMonthFixtures.map((month) => (
          <SelectItem key={month.id} value={month.id}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function useSelectedMonth() {
  const [monthId, setMonthId] = useState(customerMonthFixtures[0].id);
  const month =
    customerMonthFixtures.find((item) => item.id === monthId) ??
    customerMonthFixtures[0];

  return { month, monthId, setMonthId };
}

export function CustomerMainQuest({ onExplore }: { onExplore: () => void }) {
  const { month, monthId, setMonthId } = useSelectedMonth();
  const status = questStatusContent[month.questStatus];
  const progress = Math.min((month.coins / month.targetCoins) * 100, 100);
  const remainingCoins = Math.max(month.targetCoins - month.coins, 0);
  const reward = month.rewards[0];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            ภารกิจประจำเดือน
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เริ่มสะสมใหม่ทุกเดือน โดยประวัติรอบก่อนยังดูได้
          </p>
        </div>
        <MonthSelect value={monthId} onValueChange={setMonthId} />
      </div>

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Gift className="size-6" />
            </span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{month.label}</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">
              {month.coins.toLocaleString("th-TH")}
              <span className="ml-2 text-base font-normal text-muted-foreground">
                / {month.targetCoins.toLocaleString("th-TH")} Coins
              </span>
            </p>
          </div>
          <Progress
            value={progress}
            aria-label={`สะสม ${month.coins} จาก ${month.targetCoins} Coins`}
          />
          <div className="rounded-xl bg-muted p-4">
            <p className="font-medium">
              {remainingCoins > 0
                ? `เหลืออีก ${remainingCoins} Coins`
                : "สะสมครบเป้าหมายแล้ว"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {status.description}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {month.questStatus === "COLLECTING" ||
                month.questStatus === "CLOSED"
                  ? "วงเงินรางวัลเมื่อครบ"
                  : "วงเงินที่ได้รับ"}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatBaht(month.rewardAmount)}
              </p>
            </div>
            {month.questStatus === "COLLECTING" ? (
              <Coins className="size-7 text-muted-foreground" />
            ) : month.questStatus === "EXPIRED" ||
              month.questStatus === "CLOSED" ? (
              <CircleOff className="size-7 text-muted-foreground" />
            ) : (
              <CheckCircle2 className="size-7 text-primary" />
            )}
          </div>
          {month.questStatus === "COLLECTING" && (
            <Button className="w-full" onClick={onExplore}>
              ค้นหาร้านใหม่
              <ArrowUpRight className="size-4" />
            </Button>
          )}
          {reward && (
            <p className="text-xs text-muted-foreground">
              ได้รับสิทธิ์ {reward.grantedAt}
              {reward.usedAt ? ` • ใช้สิทธิ์ ${reward.usedAt}` : ""}
              {reward.expiredAt ? ` • หมดอายุ ${reward.expiredAt}` : ""}
            </p>
          )}
        </CardContent>
      </Card>

      <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        Coins เป็นคะแนนภารกิจและใช้ชำระแทนเงินบาทไม่ได้ ข้อมูลหน้านี้เป็น UI
        Preview ซึ่งยังไม่เชื่อมข้อมูล Coins จากระบบ
      </p>
    </section>
  );
}

function MonthSummary({ month }: { month: CustomerMonthFixture }) {
  const totalAmount = month.purchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0,
  );
  const totalCoins = month.purchases.reduce(
    (sum, purchase) => sum + purchase.coinsEarned,
    0,
  );
  const totalHelp = month.purchases.reduce(
    (sum, purchase) => sum + purchase.helpUsed + purchase.questHelpUsed,
    0,
  );

  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        ["ยอดซื้อ", formatBaht(totalAmount)],
        ["Coins ที่ได้รับ", `${totalCoins} Coins`],
        ["สิทธิ์ที่ใช้", formatBaht(totalHelp)],
      ].map(([label, value]) => (
        <div key={label} className="rounded-xl border p-3 text-center">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-2 text-sm font-semibold sm:text-base">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function CustomerMonthlyHistory() {
  const { month, monthId, setMonthId } = useSelectedMonth();

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            ประวัติรายเดือน
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            รายการซื้อ Coins และวงเงิน Main Quest ของแต่ละรอบ
          </p>
        </div>
        <MonthSelect value={monthId} onValueChange={setMonthId} />
      </div>

      <MonthSummary month={month} />

      {month.purchases.length === 0 && month.rewards.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <History className="mx-auto size-9 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">ยังไม่มีรายการในเดือนนี้</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            เมื่อมีการซื้อหรือได้รับวงเงิน Main Quest รายการจะแสดงที่นี่
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {month.rewards.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <Sparkles className="size-4" />
                ประวัติวงเงิน Main Quest
              </h3>
              {month.rewards.map((reward) => (
                <Card key={reward.id}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <span className="rounded-full bg-muted p-2">
                      <Gift className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">ได้รับวงเงิน Main Quest</p>
                        <Badge
                          variant={
                            reward.status === "AVAILABLE"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {reward.status === "AVAILABLE"
                            ? "พร้อมใช้"
                            : reward.status === "USED"
                              ? "ใช้แล้ว"
                              : "หมดอายุ"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm font-semibold">
                        +{formatBaht(reward.amount)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {reward.grantedAt}
                        {reward.usedAt ? ` • ใช้เมื่อ ${reward.usedAt}` : ""}
                        {reward.expiredAt
                          ? ` • หมดอายุเมื่อ ${reward.expiredAt}`
                          : ""}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {month.purchases.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <ReceiptText className="size-4" />
                ประวัติการซื้อ
              </h3>
              {month.purchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{purchase.storeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {purchase.purchasedAt}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold">
                        −{formatBaht(purchase.totalAmount)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <Badge variant="secondary">
                        +{purchase.coinsEarned} Coins
                      </Badge>
                      <span className="text-muted-foreground">
                        จ่ายเอง {formatBaht(purchase.customerPaid)} •
                        สิทธิ์ช่วยจ่าย{" "}
                        {formatBaht(purchase.helpUsed + purchase.questHelpUsed)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      รหัสรายการ {purchase.id}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">
        ข้อมูลทั้งหมดเป็น fixture สำหรับ UI Preview ยังไม่เชื่อม Database
      </p>
    </section>
  );
}
