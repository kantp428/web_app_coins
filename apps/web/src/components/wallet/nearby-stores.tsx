"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Coins, Map, MapPin, Search, Store } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNearbyStores } from "@/hooks/use-nearby-stores";
import type { ExploreStore } from "./nearby-stores-map";

const ExploreMap = dynamic(() => import("./nearby-stores-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
      กำลังโหลดแผนที่…
    </div>
  ),
});

const previews: ExploreStore[] = [
  {
    id: "preview-1",
    name: "ครัวชุมชนสุขใจ",
    latitude: "13.8211",
    longitude: "100.0589",
    distanceKm: 0.62,
    categories: ["อาหาร"],
    address: { line1: "ตัวอย่าง • เมืองนครปฐม" },
    coinEstimate: 10,
    preview: true,
  },
  {
    id: "preview-2",
    name: "ละมุนคอฟฟี่",
    latitude: "13.8152",
    longitude: "100.0661",
    distanceKm: 1.3,
    categories: ["เครื่องดื่ม"],
    address: { line1: "ตัวอย่าง • เมืองนครปฐม" },
    coinEstimate: 8,
    preview: true,
  },
  {
    id: "preview-3",
    name: "ร้านของใช้แบ่งปัน",
    latitude: "13.8245",
    longitude: "100.0715",
    distanceKm: 2.1,
    categories: ["ของใช้"],
    address: { line1: "ตัวอย่าง • เมืองนครปฐม" },
    coinEstimate: 9,
    preview: true,
  },
];

export function NearbyStores() {
  const { stores, loading, loaded, search } = useNearbyStores();
  const [latitude, setLatitude] = useState(""),
    [longitude, setLongitude] = useState(""),
    [radius, setRadius] = useState("5");
  const [locating, setLocating] = useState(false),
    [preview, setPreview] = useState(false),
    [showMap, setShowMap] = useState(false);
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [selectedId, setSelectedId] = useState<string | null>(null);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const available: ExploreStore[] = preview
    ? previews
    : stores.map((store) => ({ ...store, coinEstimate: null }));
  const categories = useMemo(
    () =>
      Array.from(new Set(available.flatMap((store) => store.categories))).sort(
        (a, b) => a.localeCompare(b, "th"),
      ),
    [available],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("th");
    return available.filter(
      (store) =>
        (category === "all" || store.categories.includes(category)) &&
        (!needle ||
          store.name.toLocaleLowerCase("th").includes(needle) ||
          store.categories.some((item) =>
            item.toLocaleLowerCase("th").includes(needle),
          ) ||
          Object.values(store.address ?? {}).some((item) =>
            item.toLocaleLowerCase("th").includes(needle),
          )),
    );
  }, [available, category, query]);

  function validRadius() {
    const value = Number(radius);
    if (!Number.isFinite(value) || value < 0.1 || value > 50) {
      toast.error("เลือกรัศมี 0.1–50 กม.");
      return null;
    }
    return value;
  }
  function runSearch(lat: number, lng: number, km: number) {
    setPreview(false);
    setShowMap(false);
    setSelectedId(null);
    void search(lat, lng, km);
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
        runSearch(lat, lng, km);
      },
      () => {
        if (active.current) {
          setLocating(false);
          toast.error("หาตำแหน่งไม่ได้ กรุณากรอกพิกัดแทน");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }
  function showPreview() {
    setPreview(true);
    setLatitude("13.8199");
    setLongitude("100.0622");
    setShowMap(false);
    setSelectedId(null);
  }

  const center: [number, number] = [
    Number(latitude) || 13.8199,
    Number(longitude) || 100.0622,
  ];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">ร้านใกล้ฉัน</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ใช้ตำแหน่งเมื่อกดอนุญาต หรือกรอกพิกัดเองได้
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const km = validRadius(),
            lat = Number(latitude),
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
          runSearch(lat, lng, km);
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
            <Search className="size-4" />
            {loading ? "กำลังค้นหา…" : "ค้นหาจากพิกัด"}
          </Button>
        </fieldset>
      </form>
      {!preview && (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={showPreview}
        >
          ทดลองด้วยร้านตัวอย่าง
        </Button>
      )}
      {loaded && stores.length === 0 && !preview && (
        <div className="space-y-3 rounded-xl border border-dashed p-5 text-center">
          <p className="text-sm text-muted-foreground">
            ไม่พบร้านที่อนุมัติแล้วในรัศมีนี้
          </p>
          <Button type="button" variant="outline" onClick={showPreview}>
            ดูร้านตัวอย่าง
          </Button>
        </div>
      )}
      {available.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาชื่อร้าน หมวดหมู่ หรือพื้นที่"
                aria-label="ค้นหาร้าน"
              />
            </div>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value ?? "all")}
            >
              <SelectTrigger className="h-10 w-full" aria-label="กรองหมวดหมู่">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              พบ {filtered.length} ร้าน{preview ? " • ข้อมูลตัวอย่าง" : ""}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMap((value) => !value)}
            >
              <Map className="size-4" />
              {showMap ? "ซ่อนแผนที่" : "เปิดแผนที่"}
            </Button>
          </div>
          {showMap && (
            <ExploreMap
              center={center}
              stores={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              ไม่พบร้านที่ตรงกับคำค้นหา
            </p>
          ) : (
            <div className="grid gap-3">
              {filtered.map((store) => (
                <button
                  type="button"
                  key={store.id}
                  onClick={() => {
                    setSelectedId(store.id);
                    setShowMap(true);
                  }}
                  className={`rounded-xl border p-4 text-left hover:bg-muted/60 ${selectedId === store.id ? "border-primary bg-muted/50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Store className="mt-1 size-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-semibold">{store.name}</h3>
                        {store.coinEstimate == null ? (
                          <Badge variant="outline">Coins รอเชื่อมระบบ</Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Coins className="size-3" />+{store.coinEstimate}{" "}
                            Coins
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {store.categories.join(", ") || "ไม่มีหมวดหมู่"} •{" "}
                        {store.distanceKm.toFixed(2)} กม.
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {store.address
                          ? Object.values(store.address)
                              .filter(Boolean)
                              .join(" ")
                          : "ไม่มีรายละเอียดที่อยู่"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
