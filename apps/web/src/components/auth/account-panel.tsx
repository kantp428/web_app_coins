"use client";
import { useAuth } from "@/contexts/auth-context";
import { LogoutButton } from "@/components/auth/logout-button";
export function AccountPanel() {
  const { user } = useAuth();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">บัญชีของฉัน</h1>
      <div className="space-y-2 rounded-xl border p-5">
        <p className="font-semibold">{user.displayName}</p>
        <p className="text-sm text-muted-foreground">บทบาท: {user.role}</p>
        <p className="text-sm text-muted-foreground">รหัสบัญชี: {user.id}</p>
      </div>
      <LogoutButton />
    </section>
  );
}
