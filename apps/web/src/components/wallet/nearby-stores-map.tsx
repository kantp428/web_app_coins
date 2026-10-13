"use client";

import { useEffect } from "react";
import { divIcon, latLngBounds } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { toast } from "sonner";

export type ExploreStore = {
  id: string;
  name: string;
  address: Record<string, string> | null;
  latitude: string;
  longitude: string;
  distanceKm: number;
  categories: string[];
  coinEstimate?: number | null;
  preview?: boolean;
};

type Props = {
  center: [number, number];
  stores: ExploreStore[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const searchIcon = divIcon({
  className: "explore-search-marker",
  html: '<span style="display:block;width:18px;height:18px;border-radius:50%;background:#2563eb;border:4px solid white;box-shadow:0 1px 8px #0008"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
const shopIcon = divIcon({
  className: "explore-shop-marker",
  html: '<span style="display:flex;width:30px;height:30px;align-items:center;justify-content:center;border-radius:10px;background:#171717;color:white;border:3px solid white;box-shadow:0 1px 8px #0008;font-size:15px">฿</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -16],
});

function FitMap({ center, stores }: Pick<Props, "center" | "stores">) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [center];
    stores.forEach((store) => {
      const lat = Number(store.latitude);
      const lng = Number(store.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) points.push([lat, lng]);
    });
    if (points.length === 1) map.setView(center, 14);
    else
      map.fitBounds(latLngBounds(points), { padding: [28, 28], maxZoom: 15 });
  }, [center, map, stores]);
  return null;
}

export default function NearbyStoresMap({
  center,
  stores,
  selectedId,
  onSelect,
}: Props) {
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ??
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={false}
      className="h-80 w-full rounded-xl"
      aria-label="แผนที่ร้านใกล้ฉัน"
    >
      <TileLayer
        url={tileUrl}
        attribution={attribution}
        maxZoom={19}
        eventHandlers={{
          tileerror: () =>
            toast.error("โหลดแผนที่ไม่ได้", {
              id: "explore-map-error",
              description: "ยังเลือกร้านจากรายการด้านล่างได้",
            }),
        }}
      />
      <FitMap center={center} stores={stores} />
      <Marker position={center} icon={searchIcon} title="ตำแหน่งที่ใช้ค้นหา">
        <Popup>ตำแหน่งที่ใช้ค้นหา</Popup>
      </Marker>
      {stores.map((store) => {
        const lat = Number(store.latitude),
          lng = Number(store.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return (
          <Marker
            key={store.id}
            position={[lat, lng]}
            icon={shopIcon}
            title={store.name}
            opacity={selectedId && selectedId !== store.id ? 0.6 : 1}
            eventHandlers={{ click: () => onSelect(store.id) }}
          >
            <Popup>
              <div className="min-w-40 space-y-1">
                <p className="font-semibold">{store.name}</p>
                <p>{store.categories.join(", ") || "ไม่มีหมวดหมู่"}</p>
                <p>{store.distanceKm.toFixed(2)} กม.</p>
                <p>
                  {store.coinEstimate == null
                    ? "Coins รอเชื่อมระบบ"
                    : `+${store.coinEstimate} Coins ตัวอย่าง`}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
