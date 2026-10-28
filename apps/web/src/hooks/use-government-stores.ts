"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getApiError,
  getGovernmentStores,
  updateGovernmentStore,
  type GovernmentStore,
  type GovernmentStoreStatus,
} from "@/lib/api";

export function useGovernmentStores(status: GovernmentStoreStatus | "ALL") {
  const [stores, setStores] = useState<GovernmentStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedStatus, setLoadedStatus] = useState<
    GovernmentStoreStatus | "ALL" | null
  >(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getGovernmentStores(status, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setStores(result.stores);
          setLoadedStatus(status);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) toast.error(getApiError(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt, status]);
  const update = useCallback(
    async (
      id: string,
      nextStatus: "APPROVED" | "SUSPENDED",
      reason?: string,
    ) => {
      setSavingId(id);
      try {
        await updateGovernmentStore(id, { status: nextStatus, reason });
        toast.success(
          nextStatus === "APPROVED" ? "อนุมัติร้านแล้ว" : "ระงับร้านแล้ว",
        );
        setAttempt((value) => value + 1);
        return true;
      } catch (error) {
        toast.error(getApiError(error));
        return false;
      } finally {
        setSavingId(null);
      }
    },
    [],
  );
  return {
    stores,
    loading: loading || loadedStatus !== status,
    savingId,
    update,
    retry: () => {
      setLoading(true);
      setAttempt((value) => value + 1);
    },
  };
}
