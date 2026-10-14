"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getNearbyStores,
  getApiError,
  hydrateStores,
  searchRecommendedStores,
  type NearbyStore,
  type ShopSearchScope,
} from "@/lib/api";
export function useNearbyStores() {
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [source, setSource] = useState<"llm" | "fallback" | "discovery">(
    "discovery",
  );
  const active = useRef(true),
    controller = useRef<AbortController | null>(null),
    request = useRef(0);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;

      controller.current?.abort();
    };
  }, []);
  const search = useCallback(async (scope: ShopSearchScope, query: string) => {
    controller.current?.abort();
    controller.current = new AbortController();
    const current = ++request.current;
    setLoading(true);
    setError(false);
    setLoaded(false);
    setStores([]);
    try {
      const resultStores: NearbyStore[] = [];
      let resultSource: "llm" | "fallback" | "discovery" = "discovery";
      if (query.trim()) {
        const result = await searchRecommendedStores(
          query.trim(),
          scope,
          controller.current.signal,
        );
        resultSource = result.source;
        if (result.shopIds.length > 0) {
          for (let index = 0; index < result.shopIds.length; index += 100) {
            const hydrated = await hydrateStores(
              result.shopIds.slice(index, index + 100),
              scope,
              controller.current.signal,
            );
            resultStores.push(...hydrated.stores);
          }
        }
      } else {
        for (let page = 1; ; page += 1) {
          const result = await getNearbyStores(
            scope.latitude,
            scope.longitude,
            scope.radiusKm,
            scope.categoryIds,
            page,
            controller.current.signal,
          );
          resultStores.push(...result.stores);
          if (!result.meta.hasNextPage) break;
        }
      }
      if (active.current && current === request.current) {
        setStores(resultStores);
        setSource(resultSource);
        setLoaded(true);
      }
    } catch (error) {
      if (
        active.current &&
        current === request.current &&
        !controller.current?.signal.aborted
      ) {
        setError(true);
        toast.error(getApiError(error));
      }
    } finally {
      if (active.current && current === request.current) setLoading(false);
    }
  }, []);
  return { stores, loading, loaded, error, source, search };
}
