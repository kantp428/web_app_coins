"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import { api, getApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Payment = {
  id: string;
  status: string;
  shopName: string;
  amount: string;
  helpAmount?: string;
  customerAmount?: string;
};
type Detector = {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
};
type DetectorConstructor = new (options: { formats: string[] }) => Detector;
const idPattern =
  /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

export function CustomerQrScanner() {
  const [scanning, setScanning] = useState(false);
  const [pending, setPending] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const run = useRef(0);
  const stop = useCallback(() => {
    run.current += 1;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setScanning(false);
  }, []);
  useEffect(
    () => () => {
      run.current += 1;
      stream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );
  async function inspect(id: string) {
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
    }
  }
  async function start() {
    const DetectorApi = (
      globalThis as typeof globalThis & {
        BarcodeDetector?: DetectorConstructor;
      }
    ).BarcodeDetector;
    if (!DetectorApi || !navigator.mediaDevices?.getUserMedia) {
      toast.error(
        "เบราว์เซอร์นี้ไม่รองรับการสแกน QR กรุณาใช้ Chrome หรือ Edge รุ่นล่าสุด",
      );
      return;
    }
    stop();
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      stream.current = media;
      if (!video.current) return;
      video.current.srcObject = media;
      await video.current.play();
      setScanning(true);
      const detector = new DetectorApi({ formats: ["qr_code"] });
      const current = ++run.current;
      const detect = async () => {
        if (current !== run.current || !video.current) return;
        try {
          const id = (await detector.detect(video.current))[0]?.rawValue.match(
            idPattern,
          )?.[0];
          if (id) {
            stop();
            await inspect(id);
            return;
          }
        } catch {
          /* Camera frame may still be warming up. */
        }
        if (current === run.current) requestAnimationFrame(() => void detect());
      };
      void detect();
    } catch {
      stop();
      toast.error("เปิดกล้องไม่ได้ กรุณาอนุญาตการใช้กล้องแล้วลองใหม่");
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
          {payment && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{payment.shopName}</p>
                  <p className="text-sm text-muted-foreground">
                    รัฐช่วย ฿{payment.helpAmount} · จ่ายจากกระเป๋า ฿
                    {payment.customerAmount}
                  </p>
                </div>
                <p className="text-xl font-semibold">฿{payment.amount}</p>
              </div>
              <Button
                className="w-full"
                disabled={pending || payment.status !== "PENDING"}
                onClick={() => void pay()}
              >
                ยืนยันชำระเงิน
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
