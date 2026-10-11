"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { LocationMapProps } from "./shop-location-map";
import { Button } from "@/components/ui/button";
const LocationMap = dynamic(() => import("./shop-location-map"), {
  ssr: false,
  loading: () => (
    <p
      className="flex h-80 items-center justify-center text-sm text-muted-foreground"
      role="status"
    >
      กำลังโหลดแผนที่…
    </p>
  ),
});
export function ShopLocationPicker(props: LocationMapProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">เลือกตำแหน่งร้านบนแผนที่</p>
      {open ? (
        <>
          <p className="text-sm text-muted-foreground">
            คลิกแผนที่หรือย้ายหมุดเพื่อเติมพิกัด
            แล้วตรวจสอบที่อยู่ร้านให้ถูกต้อง หรือกรอกพิกัดเองในช่องด้านล่าง
          </p>
          <div className="relative z-0 overflow-hidden rounded-xl border">
            <LocationMap {...props} />
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            เปิดแผนที่ OpenStreetMap เพื่อวางหมุดร้าน หรือกรอกพิกัดด้วยตนเอง
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={props.disabled}
            onClick={() => setOpen(true)}
          >
            เปิดแผนที่เลือกตำแหน่งร้าน
          </Button>
        </>
      )}
    </div>
  );
}
