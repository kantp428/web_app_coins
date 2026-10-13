"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getNearbyStores, getApiError, type NearbyStore } from "@/lib/api";
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
  async function search(latitude: number, longitude: number, radiusKm: number) {
    controller.current?.abort();
    controller.current = new AbortController();
    const current = ++request.current;
    setLoading(true);
    setError(false);
    setLoaded(false);
    setStores([]);
    try {
      const result = await getNearbyStores(
        latitude,
        longitude,
        radiusKm,
        controller.current.signal,
      );
      if (active.current && current === request.current) {
        setStores(result.stores);
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
  }
  return { stores, loading, loaded, error, search };
}
