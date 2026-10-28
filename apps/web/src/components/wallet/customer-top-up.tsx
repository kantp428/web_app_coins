"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import { api, getApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CustomerTopUp() {
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [testActionsEnabled, setTestActionsEnabled] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    api
      .get<{ testActionsEnabled: boolean }>("/wallet", {
        params: { action: "summary" },
        signal: controller.signal,
      })
      .then((response) =>
        setTestActionsEnabled(response.data.testActionsEnabled),
      )
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  async function submit(action: "topup" | "reset" | "resetDaily") {
    setPending(true);
    try {
      await api.post("/wallet", {
        action,
        ...(action === "topup"
          ? { amount, idempotencyKey: crypto.randomUUID() }
          : {}),
      });
      toast.success(
        {
          topup: "เติมเงินสำเร็จ",
          resetDaily: "รีเซ็ตวงเงินช่วยเหลือรายวันแล้ว",
          reset: "รีเซ็ตวงเงินช่วยเหลือรายเดือนแล้ว",
        }[action],
      );
      setAmount("");
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          เติมเงินสำหรับทดสอบ
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ระบุจำนวนเงินเพื่อเพิ่ม Balance ทันที
          ระบบนี้ยังไม่เชื่อมผู้ให้บริการรับเงิน
        </p>
      </div>
      <Card>
        <CardContent className="space-y-4 p-5">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submit("topup");
            }}
          >
            <label className="block space-y-2 text-sm">
              <span>จำนวนเงินที่ต้องการเติม (บาท)</span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className="h-14 text-xl"
                required
              />
            </label>
            <Button type="submit" disabled={pending} className="h-12 w-full">
              <Plus className="size-4" />
              {pending ? "กำลังเติมเงิน..." : "เติมเงิน"}
            </Button>
          </form>
          {testActionsEnabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={pending}
                onClick={() => void submit("resetDaily")}
              >
                <RefreshCw className="size-4" /> รีเซ็ตรายวันเป็น ฿200
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={pending}
                onClick={() => void submit("reset")}
              >
                <RefreshCw className="size-4" /> รีเซ็ตรายเดือนเป็น ฿1,000
              </Button>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                ปุ่มรีเซ็ตใช้สำหรับทดสอบระบบเท่านั้น
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
