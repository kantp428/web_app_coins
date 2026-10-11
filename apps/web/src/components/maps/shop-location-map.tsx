"use client";
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { divIcon } from "leaflet";
import { toast } from "sonner";
export type LocationMapProps = {
  latitude: string;
  longitude: string;
  disabled?: boolean;
  onChange: (latitude: string, longitude: string) => void;
};
const markerIcon = divIcon({
  className: "shop-location-marker",
  html: '<span style="display:block;width:24px;height:24px;border-radius:50%;background:#171717;border:4px solid white;box-shadow:0 1px 8px #0008"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
function SelectedLocation({
  latitude,
  longitude,
  disabled,
  onChange,
}: LocationMapProps) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    // Gate Leaflet's wheel handler without replacing its delta batching,
    // animation, or cursor-anchored zoom. Ordinary scrolling stays on the page.
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey || disabled) {
        event.stopImmediatePropagation();
        if (event.ctrlKey) event.preventDefault();
      }
    };
    container.addEventListener("wheel", wheel, {
      capture: true,
      passive: false,
    });
    return () => container.removeEventListener("wheel", wheel, true);
  }, [map, disabled]);
  const lat = Number(latitude);
  const lng = Number(longitude);
  const valid =
    latitude.trim() !== "" &&
    longitude.trim() !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;
  useMapEvents({
    click(event) {
      if (!disabled)
        onChange(event.latlng.lat.toFixed(6), event.latlng.lng.toFixed(6));
    },
  });
  useEffect(() => {
    if (valid) map.panTo([lat, lng]);
  }, [map, valid, lat, lng]);
  return valid ? (
    <Marker
      position={[lat, lng]}
      icon={markerIcon}
      draggable={!disabled}
      title="ตำแหน่งร้านที่เลือก"
      eventHandlers={{
        dragend(event) {
          const point = event.target.getLatLng();
          onChange(point.lat.toFixed(6), point.lng.toFixed(6));
        },
      }}
    />
  ) : null;
}
export default function ShopLocationMap(props: LocationMapProps) {
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ??
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  return (
    <MapContainer
      center={[13.7563, 100.5018]}
      zoom={12}
      scrollWheelZoom
      zoomAnimation
      zoomSnap={0.25}
      zoomDelta={0.5}
      wheelDebounceTime={80}
      wheelPxPerZoomLevel={120}
      className="h-80 w-full"
      aria-label="แผนที่เลือกตำแหน่งร้าน"
    >
      <TileLayer
        url={tileUrl}
        attribution={attribution}
        maxZoom={19}
        eventHandlers={{
          tileerror: () =>
            toast.error("โหลดแผนที่ไม่ได้", {
              id: "shop-map-tile-error",
              description: "ยังกรอกที่อยู่และพิกัดด้วยตนเองได้",
            }),
        }}
      />
      <SelectedLocation {...props} />
    </MapContainer>
  );
}
