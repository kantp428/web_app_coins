import type { AuthRole, AuthUser } from "@/lib/auth-types";
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export const destinations: Record<string, string> = {
  CUSTOMER: "/wallet",
  SELLER: "/store",
  GOVERNMENT: "/government",
};
export const apiUrl = process.env.API_URL ?? "http://localhost:3000";
export async function requireRole(role: AuthRole) {
  const token = (await cookies()).get("session")?.value;
  if (!token) redirect("/login");
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new Error("ไม่สามารถตรวจสอบการเข้าสู่ระบบได้ กรุณาลองใหม่");
  }
  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new Error("ไม่สามารถตรวจสอบการเข้าสู่ระบบได้");
  const user = await response.json();
  if (user.role !== role) redirect(destinations[user.role] ?? "/login");
  return user as AuthUser;
}
