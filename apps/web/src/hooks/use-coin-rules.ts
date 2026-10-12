"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createCoinRule,
  getCoinRules,
  getApiError,
  type CoinRuleInput,
  type CoinRulesData,
} from "@/lib/api";
export function useCoinRules() {
  const [data, setData] = useState<CoinRulesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();

    getCoinRules(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((error) => {
        if (!controller.signal.aborted) toast.error(getApiError(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  async function save(body: CoinRuleInput) {
    setSaving(true);
    try {
      await createCoinRule(body);
      toast.success("บันทึกกฎเวอร์ชันใหม่แล้ว");
      setLoading(true);
      setAttempt((v) => v + 1);
      return true;
    } catch (error) {
      toast.error(getApiError(error));
      setLoading(true);
      setAttempt((v) => v + 1);
      return false;
    } finally {
      setSaving(false);
    }
  }
  return {
    data,
    loading,
    saving,
    save,
    retry: () => {
      setLoading(true);
      setAttempt((v) => v + 1);
    },
  };
}
