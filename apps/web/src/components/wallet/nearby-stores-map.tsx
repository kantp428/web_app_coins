"use client";
import "leaflet/dist/leaflet.css";

import { renderToStaticMarkup } from "react-dom/server";
import { CategoryIcon, CategoryLabels } from "./category-icon";
import { useEffect } from "react";
import { divIcon, latLngBounds } from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { toast } from "sonner";
import type { NearbyStore } from "@/lib/api";

export type DrivingRoute = {
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number][];
};
type Props = {
  mode: "picker" | "stores";
  center: [number, number];
  radiusKm: number;
  stores: NearbyStore[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOriginChange: (latitude: number, longitude: number) => void;
  route: DrivingRoute | null;
};
const searchIcon = divIcon({
  className: "explore-search-marker",
  html: '<span style="display:block;width:24px;height:24px;border-radius:50%;background:#2563eb;border:4px solid white;box-shadow:0 1px 8px #0008"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
const shopIcons = new Map<string, ReturnType<typeof divIcon>>();
function shopIcon(category: string) {
  const cached = shopIcons.get(category);
  if (cached) return cached;
  const icon = divIcon({
    className: "explore-shop-marker",
    html: renderToStaticMarkup(
      <span
        style={{
          display: "flex",
          width: 30,
          height: 30,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          background: "#171717",
          color: "white",
          border: "3px solid white",
          boxShadow: "0 1px 8px #0008",
        }}
      >
        <CategoryIcon category={category} />
      </span>,
    ),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
  shopIcons.set(category, icon);
  return icon;
}

function MapBehavior({
  mode,
  center,
  stores,
  onOriginChange,
  route,
}: Pick<Props, "mode" | "center" | "stores" | "onOriginChange" | "route">) {
  const map = useMapEvents({
    click: (event) => {
      if (mode === "picker") onOriginChange(event.latlng.lat, event.latlng.lng);
    },
  });
  useEffect(() => {
    const container = map.getContainer();
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey) event.stopImmediatePropagation();
    };
    container.addEventListener("wheel", wheel, {
      capture: true,
      passive: false,
    });
    return () => container.removeEventListener("wheel", wheel, true);
  }, [map]);
  useEffect(() => {
    const points: [number, number][] = route
      ? [...route.coordinates, center]
      : [
          center,
          ...stores.map(
            (store) =>
              [Number(store.latitude), Number(store.longitude)] as [
                number,
                number,
              ],
          ),
        ];
    if (points.length === 1) map.setView(center, 14);
    else
      map.fitBounds(latLngBounds(points), { padding: [30, 30], maxZoom: 15 });
  }, [center, map, stores, route]);
  return null;
}

export default function NearbyStoresMap(props: Props) {
  const {
    mode,
    center,
    stores,
    selectedId,
    onSelect,
    onOriginChange,
    route,
    radiusKm,
  } = props;
  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom
      className="relative z-0 h-96 w-full rounded-xl"
      aria-label={
        mode === "picker" ? "แผนที่เลือกจุดค้นหา" : "แผนที่ร้านและเส้นทาง"
      }
    >
      <TileLayer
        url={
          process.env.NEXT_PUBLIC_MAP_TILE_URL ??
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
        attribution={
          process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
        maxZoom={19}
        eventHandlers={{
          tileerror: () =>
            toast.error("โหลดแผนที่ไม่ได้", {
              id: "explore-map-error",
              description: "ยังใช้ตำแหน่งปัจจุบันและเลือกร้านจากรายการได้",
            }),
        }}
      />
      <MapBehavior
        mode={mode}
        center={center}
        stores={stores}
        onOriginChange={onOriginChange}
        route={route}
      />
      <Circle
        center={center}
        radius={radiusKm * 1000}
        pathOptions={{ color: "#2563eb", weight: 1, fillOpacity: 0.04 }}
        interactive={false}
      />
      {route && (
        <Polyline
          positions={route.coordinates}
          pathOptions={{ color: "#7c3aed", weight: 5, opacity: 0.85 }}
          interactive={false}
        />
      )}
      <Marker
        position={center}
        icon={searchIcon}
        title={
          mode === "picker"
            ? "จุดค้นหา ลากหมุดเพื่อเปลี่ยนตำแหน่ง"
            : "จุดค้นหาที่เลือก"
        }
        draggable={mode === "picker"}
        eventHandlers={{
          dragend: (event) => {
            if (mode !== "picker") return;
            const point = event.target.getLatLng();
            onOriginChange(point.lat, point.lng);
          },
        }}
      >
        <Popup>
          จุดค้นหา · LAT {center[0].toFixed(6)} · LONG {center[1].toFixed(6)}
        </Popup>
      </Marker>
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={[Number(store.latitude), Number(store.longitude)]}
          icon={shopIcon(store.categories[0] ?? "other")}
          title={store.name}
          opacity={selectedId && selectedId !== store.id ? 0.6 : 1}
          eventHandlers={{ click: () => onSelect(store.id) }}
        >
          <Popup>
            <div className="min-w-40 space-y-1 font-sans text-sm leading-6">
              <div>
                หมวดหมู่: <CategoryLabels categories={store.categories} />
              </div>
              <div>ระยะเส้นตรง {store.distanceKm.toFixed(2)} กม.</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
