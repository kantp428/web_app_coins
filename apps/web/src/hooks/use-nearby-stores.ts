"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { collectMatchingStoreIds } from "@/lib/collect-store-search";
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
    const signal = controller.current.signal;
    const current = ++request.current;
    setLoading(true);
    setError(false);
    setLoaded(false);
    setStores([]);
    try {
      const resultStores: NearbyStore[] = [];
      if (query.trim()) {
        const shopIds = await collectMatchingStoreIds(
          (page) => searchRecommendedStores(query.trim(), scope, signal, page),
          signal,
        );
        if (shopIds.length > 0) {
          for (let index = 0; index < shopIds.length; index += 100) {
            const hydrated = await hydrateStores(
              shopIds.slice(index, index + 100),
              scope,
              signal,
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
            signal,
          );
          resultStores.push(...result.stores);
          if (!result.meta.hasNextPage) break;
        }
      }
      if (active.current && current === request.current) {
        setStores(resultStores);
        setLoaded(true);
      }
    } catch (error) {
      if (active.current && current === request.current && !signal.aborted) {
        setError(true);
        toast.error(getApiError(error));
      }
    } finally {
      if (active.current && current === request.current) setLoading(false);
    }
  }, []);
  return { stores, loading, loaded, error, search };
}
