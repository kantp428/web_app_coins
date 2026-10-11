import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { requireRole } from "@/lib/auth";
export default async function RoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("SELLER");
  return <AuthProvider user={user}>{children}</AuthProvider>;
}
