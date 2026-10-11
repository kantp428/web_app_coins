"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { reverseGeocode, getApiError, type ShopAddress } from "@/lib/api";
export function useReverseGeocode(
  latitude: string,
  longitude: string,
  enabled: boolean,
  onAddress: (address: ShopAddress) => void,
) {
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (
      !enabled ||
      !latitude.trim() ||
      !longitude.trim() ||
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude)) ||
      Math.abs(Number(latitude)) > 90 ||
      Math.abs(Number(longitude)) > 180
    )
      return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const address = await reverseGeocode(
          latitude,
          longitude,
          controller.signal,
        );
        if (!controller.signal.aborted) onAddress(address);
      } catch (error) {
        if (!controller.signal.aborted)
          toast.error("ค้นหาที่อยู่ไม่สำเร็จ", {
            description: getApiError(error),
          });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 800);
    return () => {
      clearTimeout(timer);
      controller.abort();
      setLoading(false);
    };
  }, [latitude, longitude, enabled, onAddress, attempt]);
  return { loading, retry: () => setAttempt((value) => value + 1) };
}
