"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Map, MapPin, Search, Store, ExternalLink, Route } from "lucide-react";
import { toast } from "sonner";
import {
  api,
  getApiError,
  getCategories,
  type ShopCategory,
  type NearbyStore,
  type ShopAddress,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReverseGeocode } from "@/hooks/use-reverse-geocode";
import { useNearbyStores } from "@/hooks/use-nearby-stores";
import { CategoryIcon, CategoryLabels } from "./category-icon";
import type { DrivingRoute } from "./nearby-stores-map";

const ExploreMap = dynamic(() => import("./nearby-stores-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-xl bg-muted text-sm">
      กำลังโหลดแผนที่…
    </div>
  ),
});
const noStores: NearbyStore[] = [];
const initialPoint: [number, number] = [14.020894, 99.991808];

export function NearbyStores() {
  const { stores, loading, loaded, error, search } = useNearbyStores();
  const [radius, setRadius] = useState("5");
  const [origin, setOrigin] = useState<[number, number]>(initialPoint);
  const [searchRadius, setSearchRadius] = useState(5);
  const [hasLocation, setHasLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState<ShopAddress | null>(
    null,
  );
  const receiveAddress = useCallback((address: ShopAddress) => {
    setLocationAddress(address);
  }, []);
  const { loading: addressLoading, retry: retryAddress } = useReverseGeocode(
    String(origin[0]),
    String(origin[1]),
    hasLocation,
    receiveAddress,
  );
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [dismissedRouteError, setDismissedRouteError] = useState<string | null>(
    null,
  );
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setSelectedId(null);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLocaleLowerCase("th");
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
  }, [stores, category, debouncedQuery]);
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
      .catch(() => {
        if (!controller.signal.aborted) {
          setRouteState({ key: routeKey, data: null, failed: true });
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
    if (!hasLocation || point[0] !== origin[0] || point[1] !== origin[1]) {
      setLocationAddress(null);
    }
    setHasLocation(true);
    setOrigin(point);
    setSearchRadius(km);
    setSelectedId(null);
    void search(point[0], point[1], km);
  }
  function locate() {
    if (validRadius() === null) return;
    if (!navigator.geolocation) {
      toast.error("อุปกรณ์ไม่รองรับตำแหน่ง กรุณาปักหมุดบนแผนที่");
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
          toast.error("หาตำแหน่งไม่ได้ กรุณาปักหมุดบนแผนที่แทน");
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
          เลือกจุดค้นหาบนแผนที่หรือลากหมุดเพื่อค้นหาร้านจริงในขอบเขต
        </p>
      </div>
      {hasLocation && (
        <div
          className="space-y-2 rounded-xl border p-4 text-sm"
          aria-live="polite"
        >
          <h3 className="font-semibold">รายละเอียดตำแหน่งที่เลือก</h3>
          <p className="tabular-nums">
            LAT {origin[0].toFixed(6)} · LONG {origin[1].toFixed(6)}
          </p>
          {addressLoading && <p role="status">กำลังค้นหารายละเอียดตำแหน่ง…</p>}
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1">
            <dt className="font-semibold">จังหวัด:</dt>
            <dd>{locationAddress?.province || "—"}</dd>
            <dt className="font-semibold">อำเภอ:</dt>
            <dd>{locationAddress?.district || "—"}</dd>
            <dt className="font-semibold">ตำบล:</dt>
            <dd>{locationAddress?.subDistrict || "—"}</dd>
            <dt className="font-semibold">รหัสไปรษณีย์:</dt>
            <dd>{locationAddress?.postcode || "—"}</dd>
          </dl>
          {!addressLoading && !locationAddress && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={retryAddress}
            >
              ค้นหารายละเอียดตำแหน่งอีกครั้ง
            </Button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={locate} disabled={locating}>
          <MapPin className="size-4" />
          {locating ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบัน"}
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-expanded={showPicker}
          aria-controls="explore-origin-picker"
          onClick={() => setShowPicker((value) => !value)}
        >
          <MapPin className="size-4" />
          {showPicker ? "ปิดแผนที่ปักหมุด" : "ปักหมุดตำแหน่งเอง"}
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-expanded={showMap}
          aria-controls="explore-store-map"
          onClick={() => setShowMap((value) => !value)}
        >
          <Map className="size-4" />
          {showMap ? "ซ่อนแผนที่ร้าน" : "ดูแผนที่ร้าน"}
        </Button>
      </div>
      {showPicker && (
        <div id="explore-origin-picker" className="space-y-2">
          <h3 className="font-semibold">เลือกจุดค้นหา</h3>
          <ExploreMap
            mode="picker"
            center={origin}
            radiusKm={searchRadius}
            stores={noStores}
            selectedId={null}
            onSelect={choose}
            onOriginChange={commitPoint}
            route={null}
          />
          <p className="text-xs text-muted-foreground">
            คลิกพื้นที่ว่างหรือลากหมุดเพื่อเปลี่ยนจุดค้นหา · Ctrl +
            เลื่อนเมาส์เพื่อซูม
          </p>
        </div>
      )}
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setDebouncedQuery(query);
          commitPoint(...origin);
        }}
      >
        <div className="min-w-0">
          <label
            className="block min-w-0 space-y-1 text-sm"
            htmlFor="explore-shop-search"
          >
            ค้นหาร้าน
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="explore-shop-search"
                className="h-10 pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาชื่อร้านหรือพื้นที่"
              />
            </div>
          </label>
        </div>
        <div className="grid min-w-0 grid-cols-2 items-end gap-2">
          <label className="flex min-w-0 flex-col gap-1 text-sm">
            <span className="block leading-5">รัศมี (กม.)</span>
            <Input
              className="h-10"
              aria-label="รัศมี (กม.)"
              type="number"
              min={0.1}
              max={50}
              step={0.1}
              required
              value={radius}
              onChange={(event) => setRadius(event.target.value)}
              onBlur={() => {
                if (Number(radius) !== searchRadius) commitPoint(...origin);
              }}
              inputMode="decimal"
            />
          </label>
          <div className="flex min-w-0 flex-col gap-1 text-sm">
            <span className="block leading-5" id="explore-category-label">
              หมวดหมู่
            </span>
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
                className="h-10 w-full min-w-0 data-[size=default]:h-10"
                aria-labelledby="explore-category-label"
              >
                <SelectValue>
                  <span className="flex min-w-0 items-center gap-1.5">
                    {category !== "all" && <CategoryIcon category={category} />}
                    <span className="truncate">
                      {category === "all" ? "ทุกหมวดหมู่" : category}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} side="bottom">
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                {categoryNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    <CategoryIcon category={name} />
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
      {showMap && (
        <div id="explore-store-map" className="space-y-2">
          <h3 className="pt-4 font-semibold">ร้านในพื้นที่และเส้นทาง</h3>
          <ExploreMap
            mode="stores"
            center={origin}
            radiusKm={searchRadius}
            stores={filtered}
            selectedId={selected?.id ?? null}
            onSelect={choose}
            onOriginChange={commitPoint}
            route={route}
          />
          <p className="text-xs text-muted-foreground">
            เลือกหมุดร้านเพื่อดูเส้นทาง · หมุดสีน้ำเงินคือจุดค้นหาที่เลือกไว้
          </p>
        </div>
      )}
      <Dialog
        open={routeFailed && dismissedRouteError !== routeKey}
        onOpenChange={(open) => {
          if (!open) setDismissedRouteError(routeKey);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <MapPin className="size-6" aria-hidden="true" />
            <DialogTitle>ไม่สามารถแสดงเส้นทางได้</DialogTitle>
            <DialogDescription>
              เปิดตำแหน่งร้านที่เลือกโดยใช้ Google Maps ได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDismissedRouteError(routeKey)}
            >
              ปิด
            </Button>
            {selected && (
              <a
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm text-primary-foreground"
                href={`https://www.google.com/maps/place/${encodeURIComponent(`${selected.latitude},${selected.longitude}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDismissedRouteError(routeKey)}
              >
                <MapPin className="size-4" aria-hidden="true" />
                เปิดโดยใช้ Google Maps
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          กด “ปักหมุดตำแหน่งเอง” เพื่อเลือกจุดค้นหา หรือใช้ตำแหน่งปัจจุบัน
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
                  <CategoryLabels categories={store.categories} />
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
