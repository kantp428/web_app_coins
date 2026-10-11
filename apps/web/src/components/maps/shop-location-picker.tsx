"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { LocateFixed, LoaderCircle } from "lucide-react";
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
  const [locating, setLocating] = useState(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  function locate() {
    if (props.disabled || locating) return;
    if (!navigator.geolocation) {
      toast.error("เบราว์เซอร์ไม่รองรับตำแหน่งปัจจุบัน", {
        description: "เลือกตำแหน่งร้านบนแผนที่แทนได้",
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active.current) return;
        setLocating(false);
        setOpen(true);
        props.onChange(
          position.coords.latitude.toFixed(6),
          position.coords.longitude.toFixed(6),
        );
      },
      (error) => {
        if (!active.current) return;
        setLocating(false);
        toast.error("ดึงตำแหน่งปัจจุบันไม่ได้", {
          description:
            error.code === 1
              ? "กรุณาอนุญาตตำแหน่งในเบราว์เซอร์ หรือเลือกหมุดเองบนแผนที่"
              : error.code === 3
                ? "หมดเวลาค้นหาตำแหน่ง ลองอีกครั้งหรือเลือกหมุดเองบนแผนที่"
                : "ตรวจสอบบริการตำแหน่งของอุปกรณ์ และเปิดผ่าน HTTPS หรือ localhost",
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">เลือกตำแหน่งร้านบนแผนที่</p>
      <Button
        type="button"
        variant="outline"
        disabled={props.disabled || locating}
        onClick={locate}
      >
        {locating ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LocateFixed className="size-4" aria-hidden="true" />
        )}
        {locating ? "กำลังค้นหาตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบัน"}
      </Button>
      <p className="text-xs text-muted-foreground">
        เมื่อกดใช้ตำแหน่งปัจจุบัน เบราว์เซอร์จะขอสิทธิ์ และส่งพิกัดไป Nominatim
        เพื่อเติมที่อยู่ ตรวจสอบว่าหมุดตรงกับร้านก่อนสมัคร
      </p>
      {locating && (
        <p role="status" className="sr-only">
          กำลังค้นหาตำแหน่งปัจจุบัน
        </p>
      )}
      {open ? (
        <>
          <p className="text-sm text-muted-foreground">
            คลิกแผนที่หรือย้ายหมุดเพื่อเติมพิกัด
          </p>
          <div className="relative z-0 overflow-hidden rounded-xl border">
            <LocationMap {...props} disabled={props.disabled || locating} />
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            เปิดแผนที่ OpenStreetMap เพื่อวางหมุดร้าน พิกัดที่เลือกจะส่งไป
            Nominatim เพื่อเติมที่อยู่ แล้วแสดงข้อมูลที่อยู่ด้านล่าง
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={props.disabled || locating}
            onClick={() => setOpen(true)}
          >
            เปิดแผนที่เลือกตำแหน่งร้าน
          </Button>
        </>
      )}
    </div>
  );
}
