"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { Coins, ImageUp, LoaderCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import { api, getApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Payment = {
  id: string;
  status: string;
  shopName: string;
  amount: string;
  helpAmount?: string;
  customerAmount?: string;
  targetHelpAmount?: string;
  canPay?: boolean;
};
const idPattern =
  /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

export function CustomerQrScanner() {
  const [scanning, setScanning] = useState(false);
  const [pending, setPending] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [manualCode, setManualCode] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const controls = useRef<{ stop(): void } | null>(null);
  const stop = useCallback(() => {
    controls.current?.stop();
    controls.current = null;
    if (video.current) video.current.srcObject = null;
    setScanning(false);
  }, []);
  useEffect(() => () => stop(), [stop]);
  async function inspect(id: string) {
    setPending(true);
    try {
      setPayment(
        (
          await api.get<Payment>("/wallet", {
            params: { action: "request", id },
          })
        ).data,
      );
      toast.success("สแกน QR สำเร็จ");
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setPending(false);
    }
  }
  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("เบราว์เซอร์นี้ไม่รองรับกล้อง กรุณาอัปโหลดรูป QR แทน");
      return;
    }
    stop();
    try {
      if (!video.current) return;
      setScanning(true);
      const reader = new BrowserQRCodeReader();
      controls.current = await reader.decodeFromConstraints(
        {
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        },
        video.current,
        (result, _error, scannerControls) => {
          const id = result?.getText().match(idPattern)?.[0];
          if (id) {
            scannerControls.stop();
            controls.current = null;
            setScanning(false);
            void inspect(id);
          }
        },
      );
    } catch {
      stop();
      toast.error("เปิดกล้องไม่ได้ กรุณาอนุญาตการใช้กล้องแล้วลองใหม่");
    }
  }
  async function inspectImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพ QR");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("รูป QR ต้องมีขนาดไม่เกิน 10 MB");
      return;
    }
    stop();
    setPending(true);
    const imageUrl = URL.createObjectURL(file);
    try {
      const result = await new BrowserQRCodeReader().decodeFromImageUrl(
        imageUrl,
      );
      const id = result.getText().match(idPattern)?.[0];
      if (!id) throw new Error("invalid payload");
      await inspect(id);
    } catch {
      toast.error("อ่าน QR จากรูปไม่ได้ กรุณาเลือกรูปที่คมชัดหรือลองใหม่");
    } finally {
      URL.revokeObjectURL(imageUrl);
      setPending(false);
      if (upload.current) upload.current.value = "";
    }
  }
  async function pay() {
    if (!payment) return;
    setPending(true);
    try {
      await api.post("/wallet", { action: "pay", id: payment.id });
      toast.success("ชำระเงินสำเร็จ");
      setPayment(null);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">สแกนจ่าย</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          เปิดกล้องแล้ววาง QR ของร้านค้าให้อยู่ในกรอบ
        </p>
      </div>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
            <video
              ref={video}
              muted
              playsInline
              aria-label="ภาพจากกล้องสำหรับสแกน QR"
              className={`size-full object-cover ${scanning ? "block" : "hidden"}`}
            />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                <QrCode className="size-16 opacity-80" />
                <p className="text-sm text-white/70">กล้องยังไม่เปิด</p>
              </div>
            )}
            {scanning && (
              <div className="pointer-events-none absolute inset-[15%] rounded-2xl border-2 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
            )}
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={pending || scanning}
              onClick={() => void start()}
            >
              <QrCode className="size-4" />
              {scanning ? "กำลังสแกน..." : "เปิดกล้องสแกน QR"}
            </Button>
            {scanning && (
              <Button variant="outline" onClick={stop}>
                ปิดกล้อง
              </Button>
            )}
          </div>
          <input
            ref={upload}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="อัปโหลดรูป QR"
            onChange={(event) => void inspectImage(event.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending || scanning}
            onClick={() => upload.current?.click()}
          >
            <ImageUp className="size-4" />
            {pending ? "กำลังอ่านรูป QR..." : "อัปโหลดรูป QR จากเครื่อง"}
          </Button>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const id = manualCode.match(idPattern)?.[0];
              if (!id) {
                toast.error("รหัส QR ไม่ถูกต้อง");
                return;
              }
              void inspect(id);
            }}
          >
            <Input
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="กรอกรหัส QR กรณีกล้องไม่รองรับ"
              aria-label="รหัส QR สำหรับชำระเงิน"
            />
            <Button type="submit" variant="outline" disabled={pending}>
              ตรวจสอบ
            </Button>
          </form>
          {pending && !payment && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border p-4 text-sm text-muted-foreground"
            >
              <LoaderCircle className="size-4 animate-spin" />
              กำลังตรวจสอบยอดและสิทธิ์ก่อนยืนยัน…
            </div>
          )}
          {payment && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">ข้อมูลจากระบบ</Badge>
                {payment.status === "PAID" && (
                  <Badge variant="outline">ยืนยันไปแล้ว</Badge>
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{payment.shopName}</p>
                  <p className="text-sm text-muted-foreground">
                    รัฐช่วย ฿{payment.helpAmount} · จ่ายจากกระเป๋า ฿
                    {payment.customerAmount}
                  </p>
                  {payment.targetHelpAmount !== payment.helpAmount && (
                    <p className="mt-1 text-xs text-amber-700">
                      Help ไม่พอ ระบบย้ายส่วนที่เหลือไปหัก Balance แล้ว
                    </p>
                  )}
                </div>
                <p className="text-xl font-semibold">฿{payment.amount}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ["ยอดซื้อ", payment.amount],
                  ["ช่วยจ่าย", payment.helpAmount ?? "0.00"],
                  ["จ่ายเอง", payment.customerAmount ?? payment.amount],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border bg-background p-2"
                  >
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-semibold">฿{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm">
                <span className="flex items-center gap-2">
                  <Coins className="size-4" />
                  Coins ที่คาดว่าจะได้รับ
                </span>
                <span className="font-semibold">รอเชื่อมระบบ</span>
              </div>
              <Button
                className="w-full"
                disabled={
                  pending ||
                  payment.status !== "PENDING" ||
                  payment.canPay === false
                }
                onClick={() => void pay()}
              >
                {pending ? "กำลังยืนยัน…" : "ยืนยันชำระเงิน"}
              </Button>
              {payment.helpAmount === "0.00" && (
                <p className="text-xs text-amber-700">
                  สิทธิ์ช่วยจ่ายหมดแล้ว ต้องชำระจากกระเป๋าเงินบาททั้งหมด
                </p>
              )}
              {payment.canPay === false && (
                <p className="text-xs text-destructive">
                  {payment.status === "PAID"
                    ? "รายการนี้ยืนยันไปแล้ว ไม่สามารถยืนยันซ้ำได้"
                    : "ยอดเงินในกระเป๋าไม่เพียงพอสำหรับยอดที่ต้องจ่ายเอง"}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                ตรวจสอบยอดซื้อ ส่วนช่วยจ่าย และยอดที่ต้องจ่ายเองก่อนยืนยัน
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
