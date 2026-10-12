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
    redirect("/login");
  }
  if (!response.ok) redirect("/login");
  let user: AuthUser;
  try {
    user = await response.json();
  } catch {
    redirect("/login");
  }
  if (
    !user ||
    typeof user.id !== "string" ||
    typeof user.displayName !== "string" ||
    !["CUSTOMER", "SELLER", "GOVERNMENT"].includes(user.role)
  )
    redirect("/login");
  if (user.role !== role) redirect(destinations[user.role] ?? "/login");
  return user as AuthUser;
}
