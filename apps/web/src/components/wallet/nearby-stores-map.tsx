"use client";
import "leaflet/dist/leaflet.css";

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
const shopIcon = divIcon({
  className: "explore-shop-marker",
  html: '<span style="display:flex;width:30px;height:30px;align-items:center;justify-content:center;border-radius:10px;background:#171717;color:white;border:3px solid white;box-shadow:0 1px 8px #0008;font-size:15px">฿</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -16],
});

function MapBehavior({
  center,
  stores,
  onOriginChange,
  route,
}: Pick<Props, "center" | "stores" | "onOriginChange" | "route">) {
  const map = useMapEvents({
    click: (event) => onOriginChange(event.latlng.lat, event.latlng.lng),
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
      aria-label="แผนที่เลือกจุดค้นหาและเส้นทางไปร้าน"
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
              description: "ยังค้นหาด้วยพิกัดและเลือกร้านจากรายการได้",
            }),
        }}
      />
      <MapBehavior
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
        title="จุดค้นหา ลากหมุดเพื่อเปลี่ยนตำแหน่ง"
        draggable
        eventHandlers={{
          dragend: (event) => {
            const point = event.target.getLatLng();
            onOriginChange(point.lat, point.lng);
          },
        }}
      >
        <Popup>จุดค้นหา · ลากหมุดเพื่อค้นหาจากจุดใหม่</Popup>
      </Marker>
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={[Number(store.latitude), Number(store.longitude)]}
          icon={shopIcon}
          title={store.name}
          opacity={selectedId && selectedId !== store.id ? 0.6 : 1}
          eventHandlers={{ click: () => onSelect(store.id) }}
        >
          <Popup>
            <div className="min-w-40 space-y-1">
              <p className="font-semibold">{store.name}</p>
              <p>{store.categories.join(", ")}</p>
              <p>ระยะเส้นตรง {store.distanceKm.toFixed(2)} กม.</p>
              <p>ดูเส้นทางและเปิด Google Maps ได้ด้านล่างแผนที่</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
