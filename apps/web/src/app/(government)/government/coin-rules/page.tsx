"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCoinRules } from "@/hooks/use-coin-rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { CoinRuleInput } from "@/lib/api";
const money = z
  .string()
  .regex(
    /^(0|[1-9][0-9]{0,11})(\.[0-9]{1,2})?$/,
    "กรอกยอดเงินไม่เกิน 2 ตำแหน่ง",
  );
const schema = z
  .object({
    minimumPurchase: money.refine(
      (v) => Number(v) > 0,
      "ยอดซื้อขั้นต่ำต้องมากกว่า 0",
    ),
    lowSalesThreshold: money,
    salesWindowDays: z.number().int().min(1).max(3650),
    repeatCoins: z.number().int().min(1).max(1),
    newLowSalesCoins: z.number().int().min(8).max(10),
    newOtherCoins: z.number().int().min(1).max(10),
  })
  .refine((v) => v.newOtherCoins <= v.newLowSalesCoins, {
    message: "Coins ร้านทั่วไปต้องไม่มากกว่าร้านยอดขายต่ำ",
    path: ["newOtherCoins"],
  });
const date = (value: string) =>
  new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
function HistoryDateTime({ value }: { value: string | null }) {
  if (!value) return <span className="font-mono">—</span>;
  const timestamp = new Date(value);
  const dateParts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    calendar: "gregory",
    numberingSystem: "latn",
    timeZone: "Asia/Bangkok",
  }).formatToParts(timestamp);
  const datePart = (type: string) =>
    dateParts.find((part) => part.type === type)?.value;
  return (
    <time
      dateTime={value}
      className="flex flex-col gap-1.5 font-mono tabular-nums"
    >
      <span>
        {`${datePart("year")}-${datePart("month")}-${datePart("day")}`}
      </span>
      <span className="text-xs text-muted-foreground">
        {new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
          timeZone: "Asia/Bangkok",
        }).format(timestamp)}
      </span>
    </time>
  );
}
const fields = [
  ["minimumPurchase", "ยอดซื้อขั้นต่ำ (บาท)", "decimal"],
  ["lowSalesThreshold", "เกณฑ์ยอดขายร้านต่ำ (บาท)", "decimal"],
  ["salesWindowDays", "ช่วงยอดขายย้อนหลัง (วัน)", "number"],
  ["newLowSalesCoins", "ลูกค้าใหม่ · ร้านยอดขายต่ำ (8–10 Coins)", "number"],
  ["newOtherCoins", "ลูกค้าใหม่ · ร้านทั่วไป (1–10 Coins)", "number"],
  ["repeatCoins", "ลูกค้าซ้ำ (1 Coin)", "number"],
] as const;
export default function Page() {
  const { data, loading, saving, save, retry, generating, generate } =
    useCoinRules();
  const [confirmGeneration, setConfirmGeneration] = useState(false);
  const [pending, setPending] = useState<CoinRuleInput | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CoinRuleInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      minimumPurchase: "",
      lowSalesThreshold: "",
      salesWindowDays: 7,
      repeatCoins: 1,
      newLowSalesCoins: 10,
      newOtherCoins: 5,
    },
  });
  const now = data ? new Date(data.serverTime).getTime() : 0;
  const queued = data?.rules.find(
    (r) => new Date(r.effective_from).getTime() > now,
  );
  const active = data?.rules.find(
    (r) =>
      new Date(r.effective_from).getTime() <= now &&
      (!r.effective_to || new Date(r.effective_to).getTime() > now),
  );
  const disabled = loading || saving || generating || !data || !!queued;
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">กติกา Coins</h1>
          <p className="text-sm text-muted-foreground">
            ล็อกเรตรอบเช้า 06:00 และรอบเย็น 18:00 น. เวลาไทย
          </p>
        </div>
        <Button
          variant="outline"
          disabled={loading || saving || generating}
          onClick={retry}
        >
          {loading ? "กำลังโหลด…" : "โหลดข้อมูลใหม่"}
        </Button>
      </div>
      {data && (
        <div className="rounded-xl border bg-background p-5 space-y-2">
          <p>
            {active
              ? `กฎปัจจุบัน: เวอร์ชัน ${active.version}`
              : "ยังไม่มีกฎที่เริ่มใช้งาน"}
          </p>
          <p className="text-sm text-muted-foreground">
            {queued
              ? `เวอร์ชัน ${queued.version} รอเริ่ม ${date(queued.effective_from)}`
              : `กฎใหม่จะเริ่มรอบถัดไป ${date(data.nextEffectiveAt)}`}
          </p>
        </div>
      )}
      <form
        noValidate
        onSubmit={handleSubmit(setPending, (e) =>
          toast.error(Object.values(e)[0]?.message ?? "กรุณาตรวจสอบข้อมูล"),
        )}
        className="rounded-xl border bg-background p-4 sm:p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">สร้างกฎเวอร์ชันใหม่</h2>
          {active && (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() =>
                reset({
                  minimumPurchase: active.minimum_purchase,
                  lowSalesThreshold: active.low_sales_threshold,
                  salesWindowDays: active.sales_window_days,
                  repeatCoins: 1,
                  newLowSalesCoins: active.new_low_sales_coins,
                  newOtherCoins: active.new_other_coins,
                })
              }
            >
              ใช้ค่ากฎปัจจุบัน
            </Button>
          )}
        </div>
        <fieldset
          disabled={disabled}
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 disabled:opacity-60"
        >
          {fields.map(([name, label, type]) => (
            <div key={name} className="space-y-2">
              <label className="text-sm font-medium" htmlFor={name}>
                {label}
              </label>
              <Input
                id={name}
                type={type === "number" ? "number" : "text"}
                inputMode={type === "decimal" ? "decimal" : "numeric"}
                readOnly={name === "repeatCoins"}
                aria-invalid={!!errors[name]}
                {...register(name, { valueAsNumber: type === "number" })}
              />
            </div>
          ))}
        </fieldset>
        <p className="text-sm text-muted-foreground">
          ลูกค้าซ้ำได้รับ 1 Coin ตามกติกาปัจจุบัน
          การบันทึกจะสร้างเวอร์ชันใหม่และไม่เปลี่ยนเรตร้านที่ล็อกไว้
        </p>
        <Button disabled={disabled} type="submit">
          {saving ? "กำลังบันทึก…" : "บันทึกเวอร์ชันใหม่"}
        </Button>
      </form>
      <section
        className="min-w-0 overflow-hidden rounded-xl border bg-background"
        aria-labelledby="rules-history-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
          <h2 id="rules-history-heading" className="text-lg font-semibold">
            ประวัติกฎ
          </h2>
          <p className="text-sm text-muted-foreground">ล่าสุด 50 เวอร์ชัน</p>
        </div>
        <div
          className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring"
          tabIndex={0}
          role="region"
          aria-label="ตารางประวัติกฎ Coins เลื่อนแนวนอนได้"
        >
          <table className="w-full min-w-250 text-left text-sm">
            <caption className="sr-only">
              ประวัติกฎ Coins แสดงเวอร์ชัน สถานะ ช่วงใช้งาน และเงื่อนไข
            </caption>
            <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
              <tr>
                {[
                  "เวอร์ชัน",
                  "สถานะ",
                  "เริ่มใช้งาน",
                  "สิ้นสุด",
                  "ซื้อขั้นต่ำ (บาท)",
                  "เกณฑ์ยอดขายต่ำ (บาท)",
                  "ย้อนหลัง (วัน)",
                  "ใหม่ / ยอดขายต่ำ",
                  "ใหม่ / ทั่วไป",
                  "ซ้ำ",
                ].map((title, index) => (
                  <th
                    key={title}
                    scope="col"
                    className={`whitespace-nowrap px-4 py-3 font-medium ${index >= 4 ? "text-right" : ""}`}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.rules.map((r) => {
                const state =
                  new Date(r.effective_from).getTime() > now
                    ? "รอเริ่ม"
                    : r.effective_to &&
                        new Date(r.effective_to).getTime() <= now
                      ? "สิ้นสุดแล้ว"
                      : "ใช้งาน";
                return (
                  <tr key={r.rule_id} className="hover:bg-muted/30">
                    <th
                      scope="row"
                      className="whitespace-nowrap px-4 py-4 font-mono font-medium"
                    >
                      v{r.version}
                    </th>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${state === "ใช้งาน" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : state === "รอเริ่ม" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}
                      >
                        {state}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <HistoryDateTime value={r.effective_from} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <HistoryDateTime value={r.effective_to} />
                    </td>
                    {[
                      Number(r.minimum_purchase).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }),
                      Number(r.low_sales_threshold).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }),
                      r.sales_window_days,
                      r.new_low_sales_coins,
                      r.new_other_coins,
                      r.repeat_coins,
                    ].map((value, index) => (
                      <td
                        key={index}
                        className="whitespace-nowrap px-4 py-4 text-right font-mono tabular-nums"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {(!data || data.rules.length === 0) && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {loading
                      ? "กำลังโหลดประวัติ…"
                      : data
                        ? "ยังไม่มีกฎ"
                        : "โหลดข้อมูลใหม่เพื่อดูประวัติ"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section
        className="min-w-0 overflow-hidden rounded-xl border bg-background"
        aria-labelledby="rate-rounds-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <h2 id="rate-rounds-heading" className="text-lg font-semibold">
            ประวัติอัปเดตเรต Coins
          </h2>
          <p className="text-sm text-muted-foreground">ล่าสุด 10 รอบ</p>
          {data?.manualGenerationEnabled && (
            <Button
              type="button"
              variant="outline"
              disabled={loading || saving || generating}
              onClick={() => setConfirmGeneration(true)}
            >
              {generating
                ? "กำลังสร้างเรต…"
                : "สร้างเรตรอบปัจจุบันทันที (ทดสอบ)"}
            </Button>
          )}
        </div>
        {data && (
          <p className="px-5 pt-4 text-sm text-muted-foreground">
            {data.automaticGenerationEnabled
              ? "สร้างเรตอัตโนมัติรอบ 06:00 และ 18:00 น. ขณะ API ทำงาน โดยตรวจทุกนาที"
              : "ปิดการสร้างเรตอัตโนมัติอยู่"}
            {
              " · เรตที่สร้างแล้วจะคงเดิมตลอดรอบ ร้านที่อนุมัติภายหลังเข้ารอบถัดไป"
            }
          </p>
        )}
        <div
          className="mt-4 overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring"
          tabIndex={0}
          role="region"
          aria-label="ตารางประวัติอัปเดตเรต Coins เลื่อนแนวนอนได้"
        >
          <table className="w-full min-w-262.5 text-left text-sm">
            <caption className="sr-only">
              สรุปจำนวนร้านและ Coins ที่แจกจริงในแต่ละรอบ
            </caption>
            <thead className="border-y bg-muted/50 text-xs text-muted-foreground">
              <tr>
                {[
                  "รอบ",
                  "สร้างเมื่อ",
                  "เริ่มใช้งาน",
                  "สิ้นสุด",
                  "ร้านทั้งหมด",
                  "ยอดต่ำกว่า 10,000 บาท",
                  "ยอดตั้งแต่ 10,000 บาท",
                  "Coins ที่แจก",
                ].map((title, index) => (
                  <th
                    key={title}
                    scope="col"
                    className={`whitespace-nowrap px-4 py-3 font-medium ${index >= 4 ? "text-right" : ""}`}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.periods.map((p) => (
                <tr key={p.period_id} className="hover:bg-muted/30">
                  <th
                    scope="row"
                    className="whitespace-nowrap px-4 py-4 font-mono font-medium"
                  >
                    {p.period_id}
                  </th>
                  {[p.created_at, p.starts_at, p.ends_at].map(
                    (value, index) => (
                      <td key={index} className="whitespace-nowrap px-4 py-4">
                        <HistoryDateTime value={value} />
                      </td>
                    ),
                  )}
                  {[
                    p.shopCount,
                    p.belowThresholdShopCount,
                    p.atOrAboveThresholdShopCount,
                  ].map((value, index) => (
                    <td
                      key={index}
                      className="whitespace-nowrap px-4 py-4 text-right font-mono tabular-nums"
                    >
                      {value.toLocaleString("th-TH")}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-4 text-right font-mono tabular-nums">
                    {BigInt(p.coinsAwarded).toLocaleString("th-TH")}
                  </td>
                </tr>
              ))}
              {(!data || data.periods.length === 0) && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {loading
                      ? "กำลังโหลดประวัติ…"
                      : data
                        ? "ยังไม่มีรอบอัปเดต ต้องมีกฎที่มีผลตอนเริ่มรอบก่อนสร้างเรต"
                        : "โหลดข้อมูลใหม่เพื่อดูประวัติ"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="px-5 py-4 text-xs text-muted-foreground">
          จำนวนร้านนับจากยอดขายที่ล็อกไว้ในรอบ โดยแบ่งที่ 10,000 บาท · Coins
          ที่แจกนับจาก ledger ตามเวลาแจกในรอบ ก่อนหักรายการย้อนคืน
          หากยังไม่มีรายการแจกจะแสดง 0
        </p>
      </section>
      <ConfirmDialog
        open={confirmGeneration}
        onOpenChange={setConfirmGeneration}
        title="สร้างเรตรอบปัจจุบันสำหรับทดสอบ"
        description="คำนวณจากยอดขายก่อนเวลาเริ่มรอบและกฎที่มีผลตอนเริ่มรอบ หากสร้างรอบนี้แล้วจะใช้เรตเดิม ไม่มีการแจก Coins ให้ลูกค้า"
        pending={generating}
        confirmLabel="สร้างเรตทันที"
        onConfirm={() => {
          void generate().then((ok) => {
            if (ok) setConfirmGeneration(false);
          });
        }}
      />
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title="ยืนยันกฎเวอร์ชันใหม่"
        description="กฎจะเริ่มที่รอบถัดไป (06:00 หรือ 18:00 น. เวลาไทย) หลังบันทึกสำเร็จจะยังสร้างกฎเพิ่มไม่ได้จนกว่ากฎนี้เริ่มใช้งาน"
        pending={saving}
        confirmLabel="บันทึกกฎ"
        onConfirm={() => {
          if (pending)
            void save(pending).then((ok) => {
              if (ok) setPending(null);
            });
        }}
      />
    </section>
  );
}
