"use client";

import { useEffect, useState } from "react";

export type DateRange = { from: string; to: string };

function bangkokToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function defaultReportRange(): DateRange {
  const to = bangkokToday();
  return { from: `${to.slice(0, 4)}-01-01`, to };
}

export function useGovernmentReport<T>(endpoint: string) {
  const initial = defaultReportRange();
  const [draft, setDraft] = useState(initial);
  const [applied, setApplied] = useState(initial);
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams(applied);
    fetch(`${endpoint}?${query}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json()) as T & { message?: string };
        if (!response.ok)
          throw new Error(body.message ?? "ไม่สามารถโหลดรายงานได้");
        return body;
      })
      .then((body) => {
        setData(body);
        setError("");
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          reason instanceof Error ? reason.message : "ไม่สามารถโหลดรายงานได้",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [applied, endpoint, reloadKey]);

  function apply() {
    setLoading(true);
    setError("");
    setApplied(draft);
    if (draft.from === applied.from && draft.to === applied.to)
      setReloadKey((value) => value + 1);
  }

  function reload() {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  }

  return { data, draft, setDraft, loading, error, apply, reload };
}
