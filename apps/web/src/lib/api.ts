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
    category: string;
    areaCode: string;
    address: string;
    latitude: number;
    longitude: number;
    openingHours: string;
    sizeClass: "SMALL" | "MEDIUM" | "LARGE";
  };
  confirmPassword: string;
};
export async function register(payload: RegisterPayload) {
  return (await authApi.post<{ message: string }>("/register", payload)).data;
}
