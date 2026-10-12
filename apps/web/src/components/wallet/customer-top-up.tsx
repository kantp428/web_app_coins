"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import { api, getApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CustomerTopUp() {
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(action: "topup" | "reset") {
    setPending(true);
    try {
      await api.post("/wallet", {
        action,
        ...(action === "topup" ? { amount } : {}),
      });
      toast.success(
        action === "topup" ? "เติมเงินสำเร็จ" : "รีเซ็ตวงเงินช่วยจ่ายแล้ว",
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
        <h2 className="text-lg font-semibold tracking-tight">QR เติมเงิน</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ระบุจำนวนเงินเพื่อเติมเข้ากระเป๋าทันที
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
            <Button disabled={pending} className="h-12 w-full">
              <Plus className="size-4" /> เติมเงิน
            </Button>
          </form>
          <Button
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={() => void submit("reset")}
          >
            <RefreshCw className="size-4" /> รีเซ็ตวงเงินช่วยจ่ายเป็น ฿1,000
            (สำหรับทดสอบ)
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
