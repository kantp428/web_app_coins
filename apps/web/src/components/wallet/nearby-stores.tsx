"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNearbyStores } from "@/hooks/use-nearby-stores";
export function NearbyStores() {
  const { stores, loading, loaded, search } = useNearbyStores();
  const [latitude, setLatitude] = useState(""),
    [longitude, setLongitude] = useState(""),
    [radius, setRadius] = useState("5"),
    [locating, setLocating] = useState(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  function validRadius() {
    const value = Number(radius);
    if (!Number.isFinite(value) || value < 0.1 || value > 50) {
      toast.error("เลือกรัศมี 0.1–50 กม.");
      return null;
    }
    return value;
  }
  function locate() {
    const km = validRadius();
    if (km === null) return;
    if (!navigator.geolocation) {
      toast.error("อุปกรณ์ไม่รองรับตำแหน่ง กรุณากรอกพิกัด");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active.current) return;
        const lat = Number(position.coords.latitude.toFixed(6)),
          lng = Number(position.coords.longitude.toFixed(6));
        setLatitude(String(lat));
        setLongitude(String(lng));
        setLocating(false);
        void search(lat, lng, km);
      },
      () => {
        if (active.current) {
          setLocating(false);
          toast.error(
            "หาตำแหน่งไม่ได้ กรุณาอนุญาตตำแหน่ง ลองใหม่ หรือกรอกพิกัด",
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">ร้านใกล้ฉัน</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ใช้พิกัดเพื่อค้นหาร้านรอบตัว ส่งพิกัดให้ระบบค้นหาร้านเมื่อกดค้นหา
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const km = validRadius();
          const lat = Number(latitude),
            lng = Number(longitude);
          if (km === null) return;
          if (
            !latitude.trim() ||
            !longitude.trim() ||
            !Number.isFinite(lat) ||
            lat < -90 ||
            lat > 90 ||
            !Number.isFinite(lng) ||
            lng < -180 ||
            lng > 180
          ) {
            toast.error("กรุณากรอกพิกัดให้ถูกต้อง");
            return;
          }
          void search(lat, lng, km);
        }}
      >
        <fieldset disabled={loading || locating} className="space-y-3">
          <Button type="button" onClick={locate}>
            <MapPin className="size-4" />
            {locating ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบัน"}
          </Button>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["latitude", "ละติจูด", latitude, setLatitude],
              ["longitude", "ลองจิจูด", longitude, setLongitude],
              ["radius", "รัศมี (กม.)", radius, setRadius],
            ].map(([id, label, value, set]) => (
              <div key={id as string} className="space-y-1">
                <label htmlFor={`nearby-${id}`} className="text-sm">
                  {label as string}
                </label>
                <Input
                  id={`nearby-${id}`}
                  value={value as string}
                  onChange={(event) =>
                    (set as (value: string) => void)(event.target.value)
                  }
                  inputMode="decimal"
                />
              </div>
            ))}
          </div>
          <Button type="submit" variant="outline">
            {loading ? "กำลังค้นหา…" : "ค้นหาจากพิกัด"}
          </Button>
        </fieldset>
      </form>
      {loaded && stores.length === 0 && (
        <p className="text-sm text-muted-foreground">
          ไม่พบร้านที่อนุมัติแล้วในรัศมีนี้ ลองขยายรัศมี
        </p>
      )}
      <div className="grid gap-3">
        {stores.map((store) => (
          <article key={store.id} className="rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <Store className="mt-1 size-5 shrink-0" />
              <div>
                <h3 className="font-semibold">{store.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {store.categories.join(", ") || "ไม่มีหมวดหมู่"} ·{" "}
                  {store.distanceKm.toFixed(2)} กม.
                </p>
                <p className="text-sm text-muted-foreground">
                  {store.address
                    ? Object.values(store.address).filter(Boolean).join(" ")
                    : "ไม่มีรายละเอียดที่อยู่"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
