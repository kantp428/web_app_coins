"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { api, getApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Coins,
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
  helpMonthlyLimit: string | null;
  month: string;
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

export function LiveWallet({
  role,
  section,
}: {
  role: "CUSTOMER" | "SELLER";
  section: "home" | "scan" | "topup" | "history" | "receive";
}) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [amount, setAmount] = useState("");
  const [payment, setPayment] = useState<RequestData | null>(null);
  const [sellerRequests, setSellerRequests] = useState<RequestData[]>([]);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const load = useCallback(async () => {
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
        if (!controller.signal.aborted) toast.error(getApiError(error));
      });
    return () => controller.abort();
  }, [section]);
  useEffect(() => {
    if (section !== "receive") return;
    const timer = window.setInterval(() => void load(), 3000);
    return () => window.clearInterval(timer);
  }, [load, section]);
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
                        PAYMENT_CREDIT: "รับชำระเงิน",
                        PAYMENT_DEBIT: "ชำระเงิน",
                      }[entry.type] ??
                      entry.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString("th-TH")} ·{" "}
                    {entry.walletType}
                  </p>
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
                  value={payment.scanPayload ?? payment.id}
                  size={192}
                  level="M"
                  marginSize={1}
                  title={`QR รับเงิน ${payment.amount} บาท`}
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
                {role === "CUSTOMER" ? "วงเงินช่วยจ่ายพื้นฐาน" : "สถานะกระเป๋า"}
              </p>
              <p className="mt-1 font-medium">
                {role === "CUSTOMER"
                  ? `฿${summary?.help ?? "—"}`
                  : "พร้อมรับเงิน"}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-60">
                {role === "CUSTOMER" ? "วงเงินต่อเดือน" : "ประเภทยอดเงิน"}
              </p>
              <p className="mt-1 font-medium">
                {role === "CUSTOMER" ? "฿1,000.00" : "ยอดขายสุทธิ"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
              <span className="text-xs">QR เติมเงิน</span>
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
                  <span className="font-medium">Main Quest</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ยังไม่เชื่อม Coins
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
