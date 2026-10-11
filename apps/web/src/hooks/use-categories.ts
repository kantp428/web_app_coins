"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCategories, getApiError, type ShopCategory } from "@/lib/api";
export function useCategories(enabled: boolean) {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const result = await getCategories(controller.signal);
        if (!controller.signal.aborted) setCategories(result);
      } catch (error) {
        if (!controller.signal.aborted)
          toast.error("โหลดหมวดหมู่ไม่ได้", {
            description: getApiError(error),
          });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [enabled, attempt]);
  return { categories, loading, retry: () => setAttempt((value) => value + 1) };
}
