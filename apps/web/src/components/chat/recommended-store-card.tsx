import { ArrowUpRight, MapPin, Store } from "lucide-react";
import type { NearbyStore } from "@/lib/api";
import { CategoryLabels } from "@/components/wallet/category-icon";

export function RecommendedStoreCard({ store }: { store: NearbyStore }) {
  const address = Object.values(store.address ?? {})
    .filter(Boolean)
    .join(" ");
  return (
    <article className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Store className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-1">
            <h4 className="min-w-0 break-words font-semibold">{store.name}</h4>
            <span className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
              <MapPin className="size-3" aria-hidden="true" />
              {store.distanceKm.toFixed(2)} กม.
            </span>
          </div>
          <div className="mt-1.5 text-xs text-muted-foreground">
            <CategoryLabels categories={store.categories} />
          </div>
        </div>
      </div>
      {(store.description || address) && (
        <div className="space-y-2 px-4 pb-4">
          {store.description && (
            <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-relaxed">
              {store.description}
            </p>
          )}
          {address && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {address}
            </p>
          )}
        </div>
      )}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.latitude},${store.longitude}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 items-center justify-between border-t px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`ดูตำแหน่ง ${store.name} ใน Google Maps (เปิดแท็บใหม่)`}
      >
        ดูตำแหน่งร้าน
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>
    </article>
  );
}
