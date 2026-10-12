"use client";
import { useState } from "react";
import {
  Check,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGovernmentStores } from "@/hooks/use-government-stores";
import type { GovernmentStore, GovernmentStoreStatus } from "@/lib/api";

const filters: { value: GovernmentStoreStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "รอตรวจสอบ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "SUSPENDED", label: "ระงับ" },
  { value: "ALL", label: "ทั้งหมด" },
];
const labels: Record<GovernmentStoreStatus, string> = {
  PENDING: "รอตรวจสอบ",
  APPROVED: "อนุมัติแล้ว",
  SUSPENDED: "ระงับ",
  REJECTED: "ไม่อนุมัติ",
};
const statusStyle: Record<GovernmentStoreStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  APPROVED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  SUSPENDED: "bg-destructive/10 text-destructive",
  REJECTED: "bg-muted text-muted-foreground",
};
function address(store: GovernmentStore) {
  if (!store.address) return "ไม่ระบุที่อยู่";
  return [
    store.address.line1,
    store.address.subDistrict,
    store.address.district,
    store.address.province,
    store.address.postcode,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Page() {
  const [filter, setFilter] = useState<GovernmentStoreStatus | "ALL">(
    "PENDING",
  );
  const { stores, loading, savingId, update, retry } =
    useGovernmentStores(filter);
  const [approve, setApprove] = useState<GovernmentStore | null>(null);
  const [suspend, setSuspend] = useState<GovernmentStore | null>(null);
  const [reason, setReason] = useState("");
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">อนุมัติร้านค้า</h1>
          <p className="text-sm text-muted-foreground">
            ตรวจข้อมูลร้านก่อนอนุญาตให้แสดงในหน้าค้นหาและรับชำระเงิน
          </p>
        </div>
        <Button
          variant="outline"
          disabled={loading || !!savingId}
          onClick={retry}
        >
          <RefreshCw
            className={loading ? "animate-spin" : ""}
            aria-hidden="true"
          />
          โหลดใหม่
        </Button>
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        aria-label="กรองสถานะร้าน"
      >
        {filters.map((item) => (
          <Button
            key={item.value}
            type="button"
            size="sm"
            variant={filter === item.value ? "default" : "outline"}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {stores.map((store) => (
          <article
            key={store.shop_id}
            className="space-y-4 rounded-xl border bg-background p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Store className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="wrap-break-word font-semibold">{store.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    ร้าน ID {store.shop_id}
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[store.participation_status]}`}
              >
                {labels[store.participation_status]}
              </span>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">ผู้สมัคร</dt>
                <dd className="wrap-break-word">{store.users.display_name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">ขนาดร้าน</dt>
                <dd>{store.size_class}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">หมวดหมู่</dt>
                <dd>
                  {store.shop_categories
                    .map((item) => item.categories.name)
                    .join(", ") || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">รายละเอียด</dt>
                <dd className="whitespace-pre-wrap wrap-break-word">
                  {store.description || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">ที่อยู่</dt>
                <dd className="wrap-break-word">{address(store)}</dd>
                <dd className="font-mono text-xs text-muted-foreground">
                  {store.latitude}, {store.longitude}
                </dd>
              </div>
              {store.reviewed_at && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">ผลตรวจล่าสุด</dt>
                  <dd>
                    {new Intl.DateTimeFormat("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Bangkok",
                    }).format(new Date(store.reviewed_at))}
                    {store.review_reason ? ` · ${store.review_reason}` : ""}
                  </dd>
                </div>
              )}
            </dl>
            {(store.participation_status === "PENDING" ||
              store.participation_status === "APPROVED") && (
              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                {store.participation_status === "PENDING" && (
                  <Button
                    disabled={!!savingId}
                    onClick={() => setApprove(store)}
                  >
                    <Check aria-hidden="true" />
                    อนุมัติร้าน
                  </Button>
                )}
                <Button
                  variant="destructive"
                  disabled={!!savingId}
                  onClick={() => {
                    setReason("");
                    setSuspend(store);
                  }}
                >
                  <ShieldAlert aria-hidden="true" />
                  ระงับร้าน
                </Button>
                {savingId === store.shop_id && (
                  <LoaderCircle
                    className="size-5 animate-spin"
                    aria-label="กำลังบันทึก"
                  />
                )}
              </div>
            )}
          </article>
        ))}
      </div>
      {!loading && stores.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          ไม่พบร้านในสถานะนี้
        </div>
      )}
      {loading && stores.length === 0 && (
        <div className="flex justify-center p-10">
          <LoaderCircle
            className="size-6 animate-spin"
            aria-label="กำลังโหลดร้าน"
          />
        </div>
      )}
      <ConfirmDialog
        open={!!approve}
        onOpenChange={(open) => !open && setApprove(null)}
        title="ยืนยันอนุมัติร้าน"
        description={`ร้าน ${approve?.name ?? ""} จะปรากฏในหน้าค้นหาร้านและสามารถสร้าง QR รับเงินได้`}
        pending={!!savingId}
        confirmLabel="อนุมัติร้าน"
        onConfirm={() => {
          if (approve)
            void update(approve.shop_id, "APPROVED").then(
              (ok) => ok && setApprove(null),
            );
        }}
      />
      <ConfirmDialog
        open={!!suspend}
        onOpenChange={(open) => !open && setSuspend(null)}
        title="ระงับร้านนี้หรือไม่"
        description={
          <div className="space-y-2">
            <span className="block">
              ร้านจะไม่แสดงในหน้าค้นหา กรุณาระบุเหตุผลเพื่อเก็บเป็นประวัติ
            </span>
            <Input
              value={reason}
              maxLength={500}
              placeholder="เหตุผลที่ระงับร้าน"
              aria-label="เหตุผลที่ระงับร้าน"
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        }
        pending={!!savingId}
        confirmLabel="ระงับร้าน"
        destructive
        onConfirm={() => {
          if (!reason.trim()) {
            toast.error("กรุณาระบุเหตุผลที่ระงับร้าน");
            return;
          }
          if (suspend)
            void update(suspend.shop_id, "SUSPENDED", reason).then(
              (ok) => ok && setSuspend(null),
            );
        }}
      />
    </section>
  );
}
