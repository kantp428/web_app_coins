import axios from "axios";
import type { AuthRole } from "@/lib/auth-types";

// Same-origin Next handlers manage the HttpOnly session cookie.
// Server components continue to call Nest through lib/auth.ts.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
export const authApi = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
export type LoginPayload = {
  username: string;
  password: string;
  role: AuthRole;
};
export async function login(payload: LoginPayload) {
  return (await authApi.post<{ destination: string }>("/login", payload)).data;
}
export async function logout() {
  await authApi.post("/logout");
}
export function getApiError(error: unknown) {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    return "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่";
  }
  return "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

export type RegisterPayload = LoginPayload & {
  firstName?: string;
  lastName?: string;
  shop?: {
    name: string;
    description: string;
    categoryIds: string[];
    address: ShopAddress;
    latitude: number;
    longitude: number;
    openingHours: {
      days: string[];
      open: string;
      close: string;
      timeZone: "Asia/Bangkok";
    };
    sizeClass: "SMALL" | "MEDIUM" | "LARGE";
  };
  confirmPassword: string;
};
export async function register(payload: RegisterPayload) {
  return (await authApi.post<{ message: string }>("/register", payload)).data;
}

export type ShopAddress = {
  line1: string;
  province: string;
  district: string;
  subDistrict: string;
  postcode: string;
};
export async function reverseGeocode(
  latitude: string,
  longitude: string,
  signal: AbortSignal,
) {
  return (
    await api.get<ShopAddress>("/geocoding", {
      params: { latitude, longitude },
      signal,
      timeout: 15000,
    })
  ).data;
}

export type ShopCategory = { id: string; name: string; slug: string };
export async function getCategories(signal: AbortSignal) {
  return (await api.get<ShopCategory[]>("/categories", { signal })).data;
}
export type CoinRuleInput = {
  minimumPurchase: string;
  lowSalesThreshold: string;
  salesWindowDays: number;
  repeatCoins: number;
  newLowSalesCoins: number;
  newOtherCoins: number;
};
export type CoinRule = {
  calculationDetail?: {
    formula: string;
    examples: { sales: string; coins: number }[];
  };
  rule_id: string;
  version: number;
  effective_from: string;
  effective_to: string | null;
  minimum_purchase: string;
  low_sales_threshold: string;
  sales_window_days: number;
  repeat_coins: number;
  new_low_sales_coins: number;
  new_other_coins: number;
};
export type CoinRulesData = {
  rules: CoinRule[];
  serverTime: string;
  nextEffectiveAt: string;
  automaticGenerationEnabled: boolean;
  manualGenerationEnabled: boolean;
  periods: {
    period_id: string;
    starts_at: string;
    ends_at: string;
    created_at: string;
    shopCount: number;
    belowThresholdShopCount: number;
    atOrAboveThresholdShopCount: number;
    stageShopCounts: number[];
    stageSalesRanges: { minimum: string; maximum: string | null }[];
    coinsAwarded: string;
  }[];
};
export async function getCoinRules(signal?: AbortSignal) {
  return (await api.get<CoinRulesData>("/government/coin-rules", { signal }))
    .data;
}
export async function createCoinRule(body: CoinRuleInput) {
  return (await api.post<CoinRule>("/government/coin-rules", body)).data;
}

export async function generateCoinRates(regenerate = false) {
  return (
    await api.post<{
      periodId: string;
      startsAt: string;
      endsAt: string;
      created: boolean;
      regenerated?: boolean;
      shopCount: number;
    }>(
      "/government/coin-rules/generate-rates",
      regenerate ? { regenerate: true } : {},
      { timeout: 50000 },
    )
  ).data;
}

export type NearbyStore = {
  description: string | null;
  id: string;
  name: string;
  address: Record<string, string> | null;
  latitude: string;
  longitude: string;
  distanceKm: number;
  categories: string[];
};
export async function getNearbyStores(
  latitude: number,
  longitude: number,
  radiusKm: number,
  categoryIds: string[] = [],
  page = 1,
  signal?: AbortSignal,
) {
  return (
    await api.get<{
      radiusKm: number;
      stores: NearbyStore[];
      meta: {
        page: number;
        pageSize: number;
        total: number;
        hasNextPage: boolean;
      };
    }>("/stores", {
      params: {
        latitude,
        longitude,
        radiusKm,
        categoryIds: categoryIds.join(","),
        page,
        pageSize: 100,
      },
      signal,
    })
  ).data;
}

export type ShopSearchScope = {
  latitude: number;
  longitude: number;
  radiusKm: number;
  categoryIds: string[];
};
export async function searchRecommendedStores(
  query: string,
  scope: ShopSearchScope,
  signal?: AbortSignal,
) {
  return (
    await api.post<{
      shopIds: string[];
      source: "llm" | "fallback" | "discovery";
    }>(
      "/recommendations/search",
      { query, ...scope },
      { signal, timeout: 30000 },
    )
  ).data;
}
export async function hydrateStores(
  shopIds: string[],
  scope: ShopSearchScope,
  signal?: AbortSignal,
) {
  return (
    await api.post<{ stores: NearbyStore[] }>(
      "/stores/batch",
      { shopIds, ...scope },
      { signal },
    )
  ).data;
}

export type GovernmentStoreStatus =
  "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
export type GovernmentStore = {
  shop_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: ShopAddress | null;
  latitude: string;
  longitude: string;
  opening_hours: { days?: string[]; open?: string; close?: string } | null;
  participation_status: GovernmentStoreStatus;
  size_class: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_reason: string | null;
  users: { user_id: string; display_name: string };
  shop_categories: { categories: ShopCategory }[];
};
export async function getGovernmentStores(
  status: GovernmentStoreStatus | "ALL",
  signal?: AbortSignal,
) {
  return (
    await api.get<{ stores: GovernmentStore[] }>("/government/stores", {
      params: { status },
      signal,
    })
  ).data;
}
export async function updateGovernmentStore(
  id: string,
  body: { status: "APPROVED" | "SUSPENDED"; reason?: string },
) {
  return (await api.patch<GovernmentStore>(`/government/stores/${id}`, body))
    .data;
}
