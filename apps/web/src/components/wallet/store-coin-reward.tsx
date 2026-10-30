import { Coins } from "lucide-react";
import type { StoreCoinRate } from "@/lib/store-coin-rate";

export function StoreCoinReward({ rate }: { rate: StoreCoinRate | null }) {
  if (!rate) {
    return (
      <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <Coins className="size-4 shrink-0" aria-hidden="true" />
        ยังไม่มีข้อมูล Coins
      </div>
    );
  }
  return (
    <div className="flex max-w-full flex-col items-end gap-1 text-right">
      <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
        <Coins className="size-5 shrink-0" aria-hidden="true" />
        <strong className="text-xl leading-none font-bold tabular-nums">
          {rate.coins}
        </strong>
        <span className="text-xs font-semibold">Coins</span>
      </span>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        ยอดซื้อขั้นต่ำ{" "}
        {Number(rate.minimumPurchase).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        บาท
      </p>
    </div>
  );
}
