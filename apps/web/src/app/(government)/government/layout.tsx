import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { AuthProvider } from "@/contexts/auth-context";
import { GovernmentShell } from "@/components/auth/government-shell";
export default async function GovernmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("GOVERNMENT");
  return (
    <AuthProvider user={user}>
      <GovernmentShell>{children}</GovernmentShell>
    </AuthProvider>
  );
}
