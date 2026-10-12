"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Gift, Coins } from "lucide-react";
import { api, getApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Quest = {
  month: string;
  months: string[];
  coins: string;
  target: number;
  remainingCoins: number;
  rewardAmount: string;
  status: string;
  canClaim: boolean;
  reward: null | {
    amount: string;
    used: string;
    available: string;
    expired: string;
    grantedAt: string;
    expiresAt: string;
  };
};
const labels: Record<string, string> = {
  IN_PROGRESS: "กำลังสะสม",
  WAITING_BUDGET: "รอจัดสรรงบ",
  AVAILABLE: "พร้อมใช้",
  USED: "ใช้สิทธิ์ครบแล้ว",
  EXPIRED: "สิทธิ์หมดอายุ",
  ENDED: "จบรอบแล้ว",
};
function dateTime(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")} ${new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value))}`;
}
export function CustomerMainQuest({ onExplore }: { onExplore: () => void }) {
  const [month, setMonth] = useState("");
  const [data, setData] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => {
    setLoading(true);
    setFailed(false);
    setReload((n) => n + 1);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    api
      .get<Quest>("/wallet", {
        params: { action: "quest", ...(month ? { month } : {}) },
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (!controller.signal.aborted) setData(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setFailed(true);
          toast.error(getApiError(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [month, reload]);
  useEffect(() => {
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);
  async function claim() {
    setClaiming(true);
    try {
      const { data } = await api.post<Quest>("/wallet", {
        action: "claimQuest",
      });
      setData(data);
      toast[data.reward ? "success" : "info"](
        data.reward
          ? "ได้รับวงเงิน Main Quest แล้ว"
          : "ยังไม่มีงบพร้อมจัดสรร กรุณาตรวจสิทธิ์ภายหลัง",
      );
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setClaiming(false);
    }
  }
  return (
    <section className="space-y-4" aria-label="Main Quest ประจำเดือน">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">ภารกิจประจำเดือน</h2>
        <Button
          variant="outline"
          size="sm"
          disabled={loading || claiming}
          onClick={refresh}
        >
          อัปเดต
        </Button>
      </div>
      {data && (
        <div className="space-y-2 text-sm">
          <label htmlFor="quest-month">เลือกรอบเดือน</label>
          <Select
            value={month || data.month}
            disabled={claiming}
            onValueChange={(value) => {
              if (!value || value === (month || data.month)) return;
              setLoading(true);
              setFailed(false);
              setMonth(value);
            }}
          >
            <SelectTrigger
              id="quest-month"
              className="h-10 w-full"
              aria-label="เลือกรอบเดือน"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              side="bottom"
              align="start"
              alignItemWithTrigger={false}
            >
              {data.months
                .filter((m) => m.slice(0, 4) === data.months[0]?.slice(0, 4))
                .map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {loading ? (
        <p role="status" className="rounded-xl border p-5 text-sm">
          กำลังโหลดภารกิจ…
        </p>
      ) : failed ? (
        <Card>
          <CardContent className="p-5 text-sm">
            <p>โหลดข้อมูลภารกิจไม่สำเร็จ</p>
            <Button className="mt-3" variant="outline" onClick={refresh}>
              ลองใหม่
            </Button>
          </CardContent>
        </Card>
      ) : (
        data && (
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex items-center justify-between gap-3">
                <Gift className="size-7" />
                <span className="rounded-full bg-muted px-3 py-1 text-sm">
                  {labels[data.status]}
                </span>
              </div>
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Coins เดือน {data.month}
                </p>
                <div
                  className="relative mx-auto size-48"
                  role="progressbar"
                  aria-label={`สะสม ${data.coins} จาก ${data.target} Coins`}
                  aria-valuemin={0}
                  aria-valuemax={data.target}
                  aria-valuenow={Math.min(Number(data.coins), data.target)}
                >
                  <svg
                    viewBox="0 0 192 192"
                    className="size-full -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="96"
                      cy="96"
                      r="82"
                      fill="none"
                      strokeWidth="12"
                      className="stroke-muted"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="82"
                      fill="none"
                      strokeWidth="12"
                      strokeLinecap="round"
                      pathLength="100"
                      strokeDasharray="100"
                      strokeDashoffset={
                        100 -
                        Math.min((Number(data.coins) / data.target) * 100, 100)
                      }
                      className="stroke-primary transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <p className="text-4xl font-semibold tracking-tight tabular-nums">
                      {BigInt(data.coins).toLocaleString("th-TH")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      / {data.target} Coins
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm">
                {data.status === "ENDED"
                  ? "รอบเดือนนี้สิ้นสุดแล้ว และไม่มีวงเงินรางวัลที่ได้รับ"
                  : data.remainingCoins > 0
                    ? `เหลืออีก ${data.remainingCoins} Coins เพื่อรับวงเงินช่วยจ่าย ${data.rewardAmount} บาท`
                    : `สะสมครบเป้าหมาย ${data.target} Coins แล้ว`}
              </p>
              {data.status === "WAITING_BUDGET" && (
                <p className="rounded-xl bg-muted p-4 text-sm">
                  ระบบยังไม่สามารถมอบวงเงินได้
                  เนื่องจากงบเดือนนี้ยังไม่พร้อมหรือไม่เพียงพอ
                  คุณสามารถกลับมาตรวจสิทธิ์ได้ภายในเดือนนี้
                </p>
              )}
              {data.reward && (
                <>
                  <dl className="grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4">
                    {[
                      ["วงเงินที่ได้รับ", data.reward.amount],
                      ["ใช้แล้ว", data.reward.used],
                      ["คงเหลือที่ใช้ได้", data.reward.available],
                      ["หมดอายุ", data.reward.expired],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="mt-1 tabular-nums">{value} บาท</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-xs text-muted-foreground">
                    ได้รับ{" "}
                    <time dateTime={data.reward.grantedAt}>
                      {dateTime(data.reward.grantedAt)}
                    </time>
                    <br />
                    สิ้นสุด{" "}
                    <time dateTime={data.reward.expiresAt}>
                      {dateTime(data.reward.expiresAt)}
                    </time>{" "}
                    (เวลาไทย)
                  </p>
                </>
              )}
              {data.canClaim && (
                <Button
                  className="w-full"
                  disabled={claiming}
                  onClick={() => void claim()}
                >
                  {claiming ? "กำลังตรวจสิทธิ์…" : "ตรวจสิทธิ์รับวงเงิน"}
                </Button>
              )}
              {data.status === "IN_PROGRESS" && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={onExplore}
                >
                  <Coins className="size-4" />
                  ค้นหาร้านเพื่อสะสม Coins
                </Button>
              )}
              {data.status === "AVAILABLE" && (
                <p className="text-sm">
                  วงเงิน Main Quest จะถูกใช้ช่วยจ่ายอัตโนมัติในการซื้อครั้งถัดไป
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                สะสมครบ 100 Coins รับวงเงิน 100
                บาทได้ครั้งเดียวต่อเดือนเมื่อมีงบ
                สิทธิ์ใช้ได้เฉพาะเดือนที่ได้รับ
                เดือนใหม่เริ่มสะสมใหม่และประวัติเดิมยังอยู่
              </p>
            </CardContent>
          </Card>
        )
      )}
    </section>
  );
}
