"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Map, MapPin, Search, Store, ExternalLink, Route } from "lucide-react";
import { toast } from "sonner";
import { api, getApiError, getCategories, type ShopCategory } from "@/lib/api";
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
import type { DrivingRoute } from "./nearby-stores-map";

const ExploreMap = dynamic(() => import("./nearby-stores-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-xl bg-muted text-sm">
      กำลังโหลดแผนที่…
    </div>
  ),
});
const initialPoint: [number, number] = [14.020894, 99.991808];

export function NearbyStores() {
  const { stores, loading, loaded, error, search } = useNearbyStores();
  const [latitude, setLatitude] = useState(String(initialPoint[0]));
  const [longitude, setLongitude] = useState(String(initialPoint[1]));
  const [radius, setRadius] = useState("5");
  const [origin, setOrigin] = useState<[number, number]>(initialPoint);
  const [searchRadius, setSearchRadius] = useState(5);
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [routeState, setRouteState] = useState<{
    key: string;
    data: DrivingRoute | null;
    failed: boolean;
  }>({ key: "", data: null, failed: false });
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    const controller = new AbortController();
    getCategories(controller.signal)
      .then(setCategories)
      .catch((error) => {
        if (!controller.signal.aborted) toast.error(getApiError(error));
      });
    return () => {
      active.current = false;
      controller.abort();
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("th");
    return stores.filter(
      (store) =>
        (category === "all" || store.categories.includes(category)) &&
        (!needle ||
          [
            store.name,
            store.description ?? "",
            ...store.categories,
            ...Object.values(store.address ?? {}),
          ].some((text) => text.toLocaleLowerCase("th").includes(needle))),
    );
  }, [stores, category, query]);
  const selected = filtered.find((store) => store.id === selectedId) ?? null;
  const routeKey = selected
    ? `${origin.join(",")}:${selected.id}:${selected.latitude},${selected.longitude}:${retry}`
    : "";
  const route = routeState.key === routeKey ? routeState.data : null;
  const routeLoading = Boolean(selected && routeState.key !== routeKey);
  const routeFailed = Boolean(
    selected && routeState.key === routeKey && routeState.failed,
  );
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    api
      .get<DrivingRoute>("/routing", {
        params: {
          originLat: origin[0],
          originLng: origin[1],
          destinationLat: selected.latitude,
          destinationLng: selected.longitude,
        },
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (!controller.signal.aborted)
          setRouteState({ key: routeKey, data, failed: false });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRouteState({ key: routeKey, data: null, failed: true });
          toast.error(getApiError(error));
        }
      });
    return () => controller.abort();
  }, [origin, selected, routeKey]);

  function validRadius() {
    const value = Number(radius);
    if (!Number.isFinite(value) || value < 0.1 || value > 50) {
      toast.error("เลือกรัศมี 0.1–50 กม.");
      return null;
    }
    return value;
  }
  function commitPoint(lat: number, lng: number) {
    const km = validRadius();
    if (km === null) return;
    const point: [number, number] = [
      Number(lat.toFixed(6)),
      Number(lng.toFixed(6)),
    ];
    setOrigin(point);
    setLatitude(String(point[0]));
    setLongitude(String(point[1]));
    setSearchRadius(km);
    setSelectedId(null);
    void search(point[0], point[1], km);
  }
  function locate() {
    if (validRadius() === null) return;
    if (!navigator.geolocation) {
      toast.error("อุปกรณ์ไม่รองรับตำแหน่ง กรุณากรอกพิกัด");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active.current) return;
        setLocating(false);
        setShowMap(true);
        commitPoint(position.coords.latitude, position.coords.longitude);
      },
      () => {
        if (active.current) {
          setLocating(false);
          toast.error("หาตำแหน่งไม่ได้ กรุณาปักหมุดหรือกรอกพิกัดแทน");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }
  function choose(id: string) {
    setSelectedId(id);
    setShowMap(true);
  }
  const categoryNames = Array.from(
    new Set([
      ...categories.map((item) => item.name),
      ...stores.flatMap((store) => store.categories),
    ]),
  );
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">ร้านใกล้ฉัน</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          เลือกจุดค้นหาบนแผนที่ ลากหมุด หรือกรอกพิกัดเพื่อค้นหาร้านจริงในขอบเขต
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={locate} disabled={locating}>
          <MapPin className="size-4" />
          {locating ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบัน"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowMap((value) => !value)}
        >
          <Map className="size-4" />
          {showMap ? "ซ่อนแผนที่" : "เปิดแผนที่เพื่อปักหมุด"}
        </Button>
      </div>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const lat = Number(latitude),
            lng = Number(longitude);
          if (
            !latitude.trim() ||
            !longitude.trim() ||
            !Number.isFinite(lat) ||
            Math.abs(lat) > 90 ||
            !Number.isFinite(lng) ||
            Math.abs(lng) > 180
          ) {
            toast.error("กรุณากรอกพิกัดให้ถูกต้อง");
            return;
          }
          commitPoint(lat, lng);
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm">
            Latitude
            <Input
              aria-label="Latitude"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <label className="space-y-1 text-sm">
            Longitude
            <Input
              aria-label="Longitude"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <label className="space-y-1 text-sm">
            รัศมี (กม.)
            <Input
              aria-label="รัศมี (กม.)"
              value={radius}
              onChange={(event) => setRadius(event.target.value)}
              inputMode="decimal"
            />
          </label>
        </div>
        <Button type="submit" variant="outline" disabled={locating}>
          <Search className="size-4" />
          {loading ? "ค้นหาใหม่จากพิกัด" : "ค้นหาจากพิกัด"}
        </Button>
      </form>
      <div className="grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-2">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedId(null);
            }}
            placeholder="ค้นหาชื่อร้านหรือพื้นที่"
            aria-label="ค้นหาร้าน"
          />
        </div>
        <Select
          items={[
            { value: "all", label: "ทุกหมวดหมู่" },
            ...categoryNames.map((name) => ({ value: name, label: name })),
          ]}
          value={category}
          onValueChange={(value) => {
            setCategory(value ?? "all");
            setSelectedId(null);
          }}
        >
          <SelectTrigger
            className="h-10 w-full min-w-0"
            aria-label="กรองหมวดหมู่"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} side="bottom">
            <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
            {categoryNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {showMap && (
        <div className="space-y-2">
          <ExploreMap
            center={origin}
            radiusKm={searchRadius}
            stores={filtered}
            selectedId={selected?.id ?? null}
            onSelect={choose}
            onOriginChange={commitPoint}
            route={route}
          />
          <p className="text-xs text-muted-foreground">
            หมุดสีน้ำเงินคือจุดค้นหา · คลิกพื้นที่ว่างหรือลากหมุดเพื่อเปลี่ยนจุด
            · Ctrl + เลื่อนเมาส์เพื่อซูม
          </p>
        </div>
      )}
      {selected && (
        <div
          className="space-y-3 rounded-xl border bg-muted/20 p-4"
          aria-label="เส้นทางไปร้านที่เลือก"
        >
          <h3 className="font-semibold">{selected.name}</h3>
          <p className="text-sm text-muted-foreground">
            ระยะเส้นตรง {selected.distanceKm.toFixed(2)} กม. จากจุดค้นหา
          </p>
          {routeLoading ? (
            <p role="status" className="text-sm">
              กำลังคำนวณเส้นทาง…
            </p>
          ) : route ? (
            <p className="text-sm">
              <Route className="mr-1 inline size-4" />
              ตามถนน {(route.distanceMeters / 1000).toFixed(2)} กม. ·
              เวลาขับรถประมาณ{" "}
              {Math.max(1, Math.ceil(route.durationSeconds / 60))} นาที
            </p>
          ) : routeFailed ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                ไม่สามารถแสดงเส้นทางได้ ยังดูระยะเส้นตรงหรือเปิด Google Maps ได้
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRetry((value) => value + 1)}
              >
                ลองคำนวณเส้นทางใหม่
              </Button>
            </div>
          ) : null}
          <a
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
            href={`https://www.google.com/maps/place/${encodeURIComponent(`${selected.latitude},${selected.longitude}`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-4" />
            เปิดใน Google Maps
          </a>
          <p className="text-xs text-muted-foreground">
            คำนวณจาก OSRM ตามถนน ไม่รวมสภาพจราจรปัจจุบัน
          </p>
        </div>
      )}
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          กำลังค้นหาร้านในขอบเขต…
        </p>
      ) : error ? (
        <div className="space-y-2 rounded-xl border p-4">
          <p className="text-sm">ค้นหาร้านไม่สำเร็จ</p>
          <Button variant="outline" onClick={() => commitPoint(...origin)}>
            ลองใหม่
          </Button>
        </div>
      ) : !loaded ? (
        <p className="text-sm text-muted-foreground">
          กดค้นหาจากพิกัด หรือเปิดแผนที่แล้วลากหมุดเพื่อเริ่มค้นหา
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          พบ {filtered.length} ร้านในรัศมี {searchRadius} กม. ·
          ระยะทางในรายการเป็นระยะเส้นตรง
        </p>
      )}
      {loaded && !loading && filtered.length === 0 && (
        <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
          ไม่พบร้านที่ตรงกับขอบเขต คำค้นหา หรือหมวดหมู่ที่เลือก
        </p>
      )}
      <div className="grid gap-3">
        {filtered.map((store) => (
          <button
            type="button"
            key={store.id}
            onClick={() => choose(store.id)}
            className={`rounded-xl border p-4 text-left hover:bg-muted/60 ${selected?.id === store.id ? "border-primary bg-muted/50" : ""}`}
            aria-pressed={selected?.id === store.id}
          >
            <div className="flex items-start gap-3">
              <Store className="mt-1 size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-semibold wrap-break-word">
                    {store.name}
                  </h3>
                  <span className="text-sm tabular-nums">
                    {store.distanceKm.toFixed(2)} กม.
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {store.categories.join(", ") || "ไม่มีหมวดหมู่"}
                </p>
                {store.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {store.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  เลือกเพื่อดูเส้นทางจากจุดค้นหา
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
