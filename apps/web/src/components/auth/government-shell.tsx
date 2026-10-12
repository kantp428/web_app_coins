"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Coins,
  ChartNoAxesCombined,
  UserRound,
  Menu,
  X,
  Landmark,
} from "lucide-react";
import { governmentRoutes } from "@/lib/role-routes";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
const icons = [LayoutDashboard, Store, Coins, ChartNoAxesCombined, UserRound];
export function GovernmentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = governmentRoutes.find((item) => item.href === pathname);
  return (
    <div className="min-h-dvh bg-muted/30 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b bg-background lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex h-20 items-center justify-between gap-3 px-5 lg:border-b">
          <Link
            href="/government"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Landmark className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold">THAI Please</span>
              <span className="block text-xs text-muted-foreground">
                ระบบจัดการภาครัฐ
              </span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={menuOpen}
            aria-controls="government-navigation"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        <nav
          id="government-navigation"
          aria-label="เมนูภาครัฐ"
          className={`${menuOpen ? "block" : "hidden"} space-y-1 p-3 lg:block lg:flex-1`}
        >
          {governmentRoutes.map((item, index) => {
            const Icon = icons[index];
            const selected = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={selected ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring ${selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t p-5 lg:block">
          <p className="truncate text-sm font-medium" title={user.displayName}>
            {user.displayName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            เจ้าหน้าที่ภาครัฐ
          </p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="hidden h-20 items-center justify-between border-b bg-background px-8 lg:flex">
          <p className="text-sm text-muted-foreground">
            ระบบภาครัฐ <span className="mx-2">/</span>
            <span className="font-medium text-foreground">
              {current?.label ?? "ภาครัฐ"}
            </span>
          </p>
          <Link
            href="/government/account"
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <UserRound className="size-4" aria-hidden="true" />
            {user.displayName}
          </Link>
        </header>
        <main className="mx-auto w-full max-w-[1600px] min-w-0 space-y-6 p-4 sm:p-6 lg:p-8 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
