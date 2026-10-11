"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { governmentRoutes } from "@/lib/role-routes";
export function GovernmentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto min-h-dvh max-w-3xl bg-background sm:border-x">
        <header className="space-y-4 border-b px-4 py-6">
          <Link href="/government" className="font-semibold">
            THAI Please • ภาครัฐ
          </Link>
          <nav aria-label="เมนูภาครัฐ" className="flex flex-wrap gap-2">
            {governmentRoutes.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`rounded-lg px-3 py-3 text-sm ${pathname === item.href ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="space-y-4 px-4 py-8">{children}</main>
      </div>
    </div>
  );
}
