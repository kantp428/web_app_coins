"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { api, getApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Coins,
  Copy,
  Download,
  History,
  MapPin,
  MessageCircle,
  QrCode,
  Wallet,
} from "lucide-react";
import { CustomerQrScanner } from "@/components/wallet/customer-qr-scanner";
import { CustomerTopUp } from "@/components/wallet/customer-top-up";

type Summary = {
  balance: string;
  help: string | null;
  helpDailyRemaining: string | null;
  helpDailyLimit: string | null;
  helpMonthlyLimit: string | null;
  month: string;
  coins: string | null;
  shopCoinRates: Array<{
    shopId: string;
    name: string;
    status: string;
    rate: {
      minimumPurchase: string;
      newCustomerCoins: number;
      repeatCustomerCoins: number;
      ruleVersion: number;
      startsAt: string;
      endsAt: string;
    } | null;
  }>;
};
type Entry = {
  id: string;
  type: string;
  walletType: string;
  amount: string;
  createdAt: string;
  shopName: string | null;
  helpAmount?: string;
  customerAmount?: string;
  rewardAmount?: string;
};
type RequestData = {
  id: string;
  status: string;
  shopName: string;
  amount: string;
  helpAmount?: string;
  customerAmount?: string;
  scanPayload?: string;
  createdAt?: string;
  expiresAt?: string;
  paidAt?: string | null;
  purchaseId?: string | null;
};

async function qrPngBlob(svg: SVGSVGElement) {
  const source = new XMLSerializer().serializeToString(svg);
  const sourceUrl = URL.createObjectURL(
    new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = sourceUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas unavailable");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("PNG unavailable");
    return blob;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function LiveWallet({
  role,
  section,
}: {
  role: "CUSTOMER" | "SELLER";
  section: "home" | "scan" | "topup" | "history" | "receive";
}) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryLoadFailed, setSummaryLoadFailed] = useState(false);
  const [history, setHistory] = useState<Entry[]>([]);
  const [amount, setAmount] = useState("");
  const [payment, setPayment] = useState<RequestData | null>(null);
  const [sellerRequests, setSellerRequests] = useState<RequestData[]>([]);
  const [pending, setPending] = useState(false);
  const qr = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const formatMoney = (value: string | null | undefined) =>
    value == null
      ? "—"
      : Number(value).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  const load = useCallback(async () => {
    setSummaryLoadFailed(false);
    try {
      if (section === "history")
        setHistory(
          (await api.get<Entry[]>("/wallet", { params: { action: "history" } }))
            .data,
        );
      else if (section === "receive")
        setSellerRequests(
          (
            await api.get<RequestData[]>("/wallet", {
              params: { action: "requests" },
            })
          ).data,
        );
      else
        setSummary(
          (await api.get<Summary>("/wallet", { params: { action: "summary" } }))
            .data,
        );
    } catch (error) {
      setSummaryLoadFailed(true);
      toast.error(getApiError(error));
    }
  }, [section]);
  useEffect(() => {
    const controller = new AbortController();
    const request =
      section === "history"
        ? api.get<Entry[]>("/wallet", {
            params: { action: "history" },
            signal: controller.signal,
          })
        : section === "receive"
          ? api.get<RequestData[]>("/wallet", {
              params: { action: "requests" },
              signal: controller.signal,
            })
          : api.get<Summary>("/wallet", {
              params: { action: "summary" },
              signal: controller.signal,
            });
    request
      .then((response) => {
        if (controller.signal.aborted) return;
        if (section === "history") setHistory(response.data as Entry[]);
        else if (section === "receive")
          setSellerRequests(response.data as RequestData[]);
        else setSummary(response.data as Summary);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setSummaryLoadFailed(true);
          toast.error(getApiError(error));
        }
      });
    return () => controller.abort();
  }, [section]);
  useEffect(() => {
    if (section !== "receive" && !(role === "SELLER" && section === "home"))
      return;
    const timer = window.setInterval(
      () => void load(),
      section === "receive" ? 3000 : 60000,
    );
    return () => window.clearInterval(timer);
  }, [load, section, role]);
  async function mutate(action: string, data: Record<string, string> = {}) {
    setPending(true);
    try {
      const result = (await api.post("/wallet", { action, ...data })).data;
      toast.success(action === "pay" ? "ชำระเงินสำเร็จ" : "บันทึกสำเร็จ");
      await load();
      return result;
    } catch (error) {
      toast.error(getApiError(error));
      return null;
    } finally {
      setPending(false);
    }
  }
  async function copyQrCode() {
    if (!payment) return;
    try {
      await navigator.clipboard.writeText(payment.scanPayload ?? payment.id);
      toast.success("คัดลอกโค้ด QR แล้ว");
    } catch {
      toast.error("คัดลอกโค้ด QR ไม่ได้ กรุณาเลือกโค้ดด้านบนแทน");
    }
  }
  async function saveQr() {
    if (!qr.current || !payment) return;
    try {
      const blob = await qrPngBlob(qr.current);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `thai-please-qr-${payment.amount.replace(".", "-")}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("บันทึกรูป QR แล้ว");
    } catch {
      toast.error("บันทึกรูป QR ไม่สำเร็จ กรุณาลองใหม่");
    }
  }
  if (section === "history")
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">ประวัติเงินเข้าออก</h2>
        {history.length === 0 ? (
          <p className="rounded-xl border p-5 text-sm text-muted-foreground">
            ยังไม่มีรายการ
          </p>
        ) : (
          history.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {entry.shopName ??
                      {
                        TOPUP: "เติมเงิน",
                        BASE_ALLOCATION: "วงเงินช่วยเหลือ",
                        REWARD_ALLOCATION: "วงเงิน Main Quest",
                        PAYMENT_CREDIT: "รับชำระเงิน",
                        PAYMENT_DEBIT: "ชำระเงิน",
                      }[entry.type] ??
                      entry.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString("th-TH")} ·{" "}
                    {entry.walletType}
                  </p>
                  {entry.rewardAmount && (
                    <p className="text-xs text-muted-foreground">
                      Main Quest ฿{entry.rewardAmount}
                    </p>
                  )}
                  {entry.helpAmount && (
                    <p className="text-xs text-muted-foreground">
                      Help ฿{entry.helpAmount} · Balance ฿
                      {entry.customerAmount ?? "0.00"}
                    </p>
                  )}
                </div>
                <p
                  className={`font-semibold ${Number(entry.amount) >= 0 ? "text-emerald-600" : "text-destructive"}`}
                >
                  {Number(entry.amount) >= 0 ? "+" : ""}฿
                  {Number(entry.amount).toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    );
  if (section === "receive")
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">สร้าง QR รับเงิน</h2>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const value = await mutate("create", { amount });
            if (value) {
              setPayment(value);
              await load();
            }
          }}
        >
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="จำนวนเงิน"
            required
          />
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "กำลังสร้าง QR..." : "สร้าง QR ใช้ครั้งเดียว"}
          </Button>
        </form>
        {payment && (
          <Card>
            <CardContent className="space-y-3 p-6 text-center">
              <div className="mx-auto w-fit rounded-xl border bg-white p-4">
                <QRCodeSVG
                  ref={qr}
                  value={payment.scanPayload ?? payment.id}
                  size={192}
                  level="M"
                  marginSize={1}
                  title={`รับเงิน ${payment.amount} บาท`}
                />
              </div>
              <p className="text-2xl font-semibold">฿{payment.amount}</p>
              <p className="text-sm">{payment.shopName}</p>
              <p className="break-all rounded bg-muted p-3 font-mono text-xs">
                {payment.scanPayload}
              </p>
              <p className="text-xs text-muted-foreground">
                ใช้ได้ครั้งเดียวและหมดอายุเวลา{" "}
                {payment.expiresAt
                  ? new Date(payment.expiresAt).toLocaleTimeString("th-TH")
                  : "—"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void copyQrCode()}
                >
                  <Copy className="size-4" /> คัดลอกโค้ด QR
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void saveQr()}
                >
                  <Download className="size-4" /> บันทึกรูป QR
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="space-y-2">
          <h3 className="font-medium">QR ล่าสุด</h3>
          {sellerRequests.length === 0 ? (
            <p className="rounded-xl border p-4 text-sm text-muted-foreground">
              ยังไม่มี QR รับเงิน
            </p>
          ) : (
            sellerRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">฿{request.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.status} · {request.shopName}
                    </p>
                  </div>
                  {request.status === "PENDING" && (
                    <Button
                      variant="outline"
                      disabled={pending}
                      onClick={async () => {
                        await mutate("cancel", { id: request.id });
                        await load();
                      }}
                    >
                      ยกเลิก
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    );
  if (section === "scan") return <CustomerQrScanner />;
  if (section === "topup") return <CustomerTopUp />;
  return (
    <section className="space-y-7">
      <Card className="border-primary bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-sm">
            <span>
              {role === "SELLER" ? "ยอดเงินจากการขาย" : "ยอดเงินในกระเป๋า"}
            </span>
            <Wallet className="size-5 opacity-70" />
          </div>
          <p className="mb-1 mt-5 text-4xl font-semibold tracking-tight">
            ฿
            {summary
              ? Number(summary.balance).toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "—"}
          </p>
          <p className="text-xs opacity-60">เงินบาท · ยอดจากระบบจริง</p>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-primary-foreground/20 pt-4">
            <div>
              <p className="text-xs opacity-60">
                {role === "CUSTOMER"
                  ? "ไทยช่วยไทยคงเหลือวันนี้"
                  : "สถานะกระเป๋า"}
              </p>
              <p className="mt-1 font-medium">
                {role === "CUSTOMER"
                  ? `฿${formatMoney(summary?.helpDailyRemaining)}`
                  : "พร้อมรับเงิน"}
              </p>
              {role === "CUSTOMER" && (
                <p className="mt-1 text-xs opacity-60">
                  จาก ฿{formatMoney(summary?.helpDailyLimit)} ต่อวัน
                </p>
              )}
            </div>
            <div>
              <p className="text-xs opacity-60">
                {role === "CUSTOMER"
                  ? "เงินช่วยเหลือคงเหลือเดือนนี้"
                  : "ประเภทยอดเงิน"}
              </p>
              <p className="mt-1 font-medium">
                {role === "CUSTOMER"
                  ? `฿${formatMoney(summary?.help)}`
                  : "ยอดขายสุทธิ"}
              </p>
              {role === "CUSTOMER" && (
                <p className="mt-1 text-xs opacity-60">
                  จาก ฿{formatMoney(summary?.helpMonthlyLimit)} ต่อเดือน
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {role === "SELLER" && (
        <section className="space-y-3" aria-label="Coins ที่ลูกค้าจะได้รับ">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <Coins className="size-5" />
              Coins ของร้านตอนนี้
            </h2>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              อัปเดต
            </Button>
          </div>
          {summaryLoadFailed ? (
            <p className="rounded-xl border p-4 text-sm text-muted-foreground">
              โหลดเรต Coins ไม่สำเร็จ กรุณากดอัปเดตเพื่อลองใหม่
            </p>
          ) : !summary ? (
            <p className="text-sm text-muted-foreground" role="status">
              กำลังโหลดเรต Coins…
            </p>
          ) : summary.shopCoinRates.length === 0 ? (
            <p className="rounded-xl border p-4 text-sm text-muted-foreground">
              ยังไม่มีร้านค้าในบัญชีนี้
            </p>
          ) : (
            summary.shopCoinRates.map((shop) => (
              <Card key={shop.shopId}>
                <CardContent className="space-y-3 p-5">
                  <h3 className="font-semibold wrap-break-word">{shop.name}</h3>
                  {shop.rate ? (
                    <>
                      <p className="text-sm">
                        ซื้อครบ {formatMoney(shop.rate.minimumPurchase) + " "}
                        บาทต่อรายการ จึงได้รับ Coins
                      </p>
                      <dl className="grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3">
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            ไม่เคยได้รับ Coins จากร้านนี้
                          </dt>
                          <dd className="mt-1 font-mono tabular-nums">
                            {shop.rate.newCustomerCoins} Coins
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            เคยได้รับ Coins จากร้านนี้แล้ว
                          </dt>
                          <dd className="mt-1 font-mono tabular-nums">
                            {shop.rate.repeatCustomerCoins} Coin
                          </dd>
                        </div>
                      </dl>
                      <p className="text-xs text-muted-foreground">
                        กฎเวอร์ชัน{" "}
                        <span className="font-mono">
                          {shop.rate.ruleVersion}
                        </span>{" "}
                        · เรตรอบนี้ถึง{" "}
                        <span className="font-mono">
                          {new Intl.DateTimeFormat("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hourCycle: "h23",
                            timeZone: "Asia/Bangkok",
                          }).format(new Date(shop.rate.endsAt))}
                        </span>{" "}
                        น. (เวลาไทย)
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {shop.status === "APPROVED"
                        ? "ยังไม่มีเรต Coins ในรอบปัจจุบัน ลูกค้ายังไม่ได้รับ Coins จนกว่าจะมีเรตในรอบถัดไป"
                        : shop.status === "PENDING"
                          ? "ร้านยังรออนุมัติ จึงยังไม่สามารถรับชำระเงินหรือแจก Coins ได้"
                          : "ร้านถูกระงับ จึงยังไม่สามารถรับชำระเงินหรือแจก Coins ได้"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
          <p className="text-xs text-muted-foreground">
            อัปเดตเรตทุกนาที · ยอดต่ำกว่าขั้นต่ำไม่ได้ Coins
            และระบบตรวจเรตอีกครั้งเมื่อชำระเงินสำเร็จ
          </p>
        </section>
      )}
      {role === "CUSTOMER" && (
        <>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              className="h-22 flex-col gap-2 rounded-xl px-2"
              onClick={() => router.push("/wallet/scan")}
            >
              <QrCode className="size-5" />
              <span className="text-xs">สแกนจ่าย</span>
            </Button>
            <Button
              variant="outline"
              className="h-22 flex-col gap-2 rounded-xl px-2"
              onClick={() => router.push("/wallet/top-up")}
            >
              <Wallet className="size-5" />
              <span className="text-xs">เติมเงิน</span>
            </Button>
            <Button
              variant="outline"
              className="h-22 flex-col gap-2 rounded-xl px-2"
              onClick={() => router.push("/wallet/explore")}
            >
              <MapPin className="size-5" />
              <span className="text-xs">ร้านใกล้ฉัน</span>
            </Button>
            <Button
              variant="outline"
              className="h-22 flex-col gap-2 rounded-xl px-2"
              onClick={() => toast.info("ผู้ช่วย AI ยังอยู่ระหว่างเชื่อมต่อ")}
            >
              <MessageCircle className="size-5" />
              <span className="text-xs">ผู้ช่วย AI</span>
            </Button>
          </div>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="size-5" />
                  <span className="font-medium">Coins เดือนนี้</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    {summary?.coins == null
                      ? "—"
                      : BigInt(summary.coins).toLocaleString("th-TH")}
                  </span>{" "}
                  Coins
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/wallet/history")}
              >
                <History className="size-4" />
                ดูประวัติเงินเข้าออก
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
