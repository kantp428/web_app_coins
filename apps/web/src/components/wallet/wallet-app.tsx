"use client";

import { useState } from "react";
import { NearbyStores } from "@/components/wallet/nearby-stores";
import { LiveWallet } from "@/components/wallet/live-wallet";
import { CustomerMainQuest } from "@/components/wallet/customer-main-quest";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { customerRoutes, sellerRoutes } from "@/lib/role-routes";
import {
  ArrowUpRight,
  ChevronRight,
  Coins,
  Compass,
  Gift,
  History,
  Home,
  MapPin,
  MessageCircle,
  QrCode,
  Settings,
  ShieldCheck,
  Store,
  User,
  Wallet,
  X,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const shops = [
  {
    name: "ครัวป้าเล็ก",
    category: "อาหาร",
    distance: "350 ม.",
    coins: 10,
    icon: "🍜",
    description: "อาหารตามสั่ง • ตลาดสามย่าน",
  },
  {
    name: "ละมุนคอฟฟี่",
    category: "เครื่องดื่ม",
    distance: "600 ม.",
    coins: 8,
    icon: "☕",
    description: "กาแฟและขนม • ซอยจุฬา 12",
  },
  {
    name: "ร้านชุมชนของชำ",
    category: "ของใช้",
    distance: "850 ม.",
    coins: 9,
    icon: "🛍️",
    description: "ของใช้ประจำวัน • สามย่าน",
  },
];
const tabs: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "กระเป๋า", icon: Wallet },
  { id: "explore", label: "ค้นหาร้าน", icon: Compass },
  { id: "quest", label: "ภารกิจ", icon: Gift },
  { id: "history", label: "ประวัติ", icon: History },
  { id: "profile", label: "บัญชี", icon: User },
];
const sellerTabs = [
  { id: "home", label: "ภาพรวม", icon: Home },
  { id: "receive", label: "รับเงิน", icon: QrCode },
  { id: "history", label: "รายการขาย", icon: History },
  { id: "manage", label: "ร้านของฉัน", icon: Store },
  { id: "profile", label: "บัญชี", icon: User },
];

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function WalletApp({
  role = "normal",
  section = "home",
}: {
  role?: "normal" | "store";
  section?:
    | "home"
    | "scan"
    | "topup"
    | "explore"
    | "quest"
    | "history"
    | "receive"
    | "manage"
    | "profile";
}) {
  const { user } = useAuth();
  const seller = role === "store";
  const tab = section;
  const livePage =
    ["home", "scan", "topup", "receive", "explore", "history"].includes(tab) ||
    (!seller && tab === "quest");
  const router = useRouter();
  const routes = seller ? sellerRoutes : customerRoutes;
  function navigate(section: string) {
    router.push(routes[section]);
  }
  const [selected, setSelected] = useState<(typeof shops)[number] | null>(null);
  const [notice, setNotice] = useState("");
  const [storeName, setStoreName] = useState("ครัวป้าเล็ก");
  const [storeCategory, setStoreCategory] = useState("อาหาร");
  const [area, setArea] = useState("ตลาดสามย่าน กรุงเทพมหานคร");
  const [hours, setHours] = useState("08:00 – 18:00");
  const [amount, setAmount] = useState("");
  const [qr, setQr] = useState(false);
  const nav = seller ? sellerTabs : tabs;
  const filtered = shops;
  function shopCards() {
    return (
      <div className="space-y-3">
        {filtered.length ? (
          filtered.map((s) => (
            <button
              key={s.name}
              onClick={() => setSelected(s)}
              className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                {s.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{s.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.category} · {s.distance} · ร้านใหม่สำหรับคุณ
                </p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Coins className="size-3" />+{s.coins}
              </Badge>
            </button>
          ))
        ) : (
          <p className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
            ไม่พบร้าน ลองเปลี่ยนคำค้นหาหรือหมวดหมู่
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto min-h-dvh max-w-lg bg-background sm:border-x">
        <header className="space-y-5 px-5 pb-5 pt-6">
          <div className="flex items-center justify-between">
            <Link
              href={routes.home}
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wallet className="size-4" />
              </span>
              THAI Please
              <span className="text-muted-foreground font-normal">
                / wallet
              </span>
            </Link>
            {!livePage && <Badge variant="outline">UI Preview</Badge>}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {seller ? "พื้นที่สำหรับร้านค้า" : "ยินดีต้อนรับกลับ"}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {seller ? user.displayName : `สวัสดี, ${user.displayName}`}
              </h1>
            </div>
            <button
              onClick={() => navigate("profile")}
              aria-label="เปิดบัญชี"
              className="flex size-11 items-center justify-center rounded-full border bg-muted"
            >
              <User className="size-5" />
            </button>
          </div>
        </header>
        <main className="space-y-7 px-5 pb-28">
          {["home", "scan", "topup", "receive", "history"].includes(tab) && (
            <LiveWallet
              onOpenChat={() => navigate("chat")}
              role={seller ? "SELLER" : "CUSTOMER"}
              section={tab as "home" | "scan" | "topup" | "history" | "receive"}
            />
          )}
          {notice && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <span>{notice}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotice("")}
                aria-label="ปิดข้อความ"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
          {false && tab === "home" && (
            <>
              <Card className="border-primary bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between text-sm">
                    <span>{seller ? "ยอดขายวันนี้" : "ยอดเงินในกระเป๋า"}</span>
                    <Wallet className="size-5 opacity-70" />
                  </div>
                  <p className="mb-1 mt-5 text-4xl font-semibold tracking-tight">
                    ฿{seller ? "1,280" : "2,450"}
                    <span className="text-2xl opacity-60">.00</span>
                  </p>
                  <p className="text-xs opacity-60">
                    {seller
                      ? "12 รายการสำเร็จ • ข้อมูลตัวอย่าง"
                      : "เงินบาท • ข้อมูลตัวอย่าง"}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-primary-foreground/20 pt-4">
                    <div>
                      <p className="text-xs opacity-60">
                        {seller ? "ลูกค้าจ่าย" : "วงเงินช่วยจ่ายพื้นฐาน"}
                      </p>
                      <p className="mt-1 font-medium">
                        ฿{seller ? "640.00" : "850.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-60">
                        {seller ? "ส่วนช่วยจ่าย" : "วงเงิน Main Quest"}
                      </p>
                      <p className="mt-1 font-medium">
                        ฿{seller ? "640.00" : "0.00"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-3 gap-3">
                {(seller
                  ? [
                      { icon: QrCode, label: "รับเงิน", target: "receive" },
                      { icon: History, label: "รายการขาย", target: "history" },
                      { icon: Settings, label: "จัดการร้าน", target: "manage" },
                    ]
                  : [
                      { icon: QrCode, label: "สแกนจ่าย", target: "scan" },
                      { icon: MapPin, label: "ร้านใกล้ฉัน", target: "explore" },
                      {
                        icon: MessageCircle,
                        label: "ผู้ช่วย AI",
                        target: "chat",
                      },
                    ]
                ).map((a) => (
                  <Button
                    key={a.target}
                    variant="outline"
                    className="h-22 flex-col gap-2 rounded-xl"
                    onClick={() =>
                      a.target === "chat"
                        ? navigate("chat")
                        : a.target === "scan"
                          ? setNotice(
                              "ต้นแบบยังไม่เปิดกล้อง เลือกร้านในหน้าค้นหาเพื่อดูรายละเอียดได้",
                            )
                          : navigate(a.target)
                    }
                  >
                    <a.icon className="size-5" />
                    <span className="text-xs">{a.label}</span>
                  </Button>
                ))}
              </div>
              {seller ? (
                <Section
                  title="ร้านพร้อมรับลูกค้า"
                  subtitle="ข้อมูลการเข้าร่วมโครงการ"
                >
                  <Card>
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-5" />
                        <span className="font-medium">เข้าร่วมโครงการแล้ว</span>
                        <Badge variant="secondary" className="ml-auto">
                          อนุมัติ
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ลูกค้าใหม่อาจได้รับ 8–10 Coins ตามเกณฑ์ของระบบ
                        ร้านค้าไม่สามารถกำหนด Coins เองได้
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("manage")}
                      >
                        ดูข้อมูลร้าน
                        <ChevronRight className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Section>
              ) : (
                <>
                  <Section title="ทุกการใช้จ่าย พาไปใกล้เป้าหมาย">
                    <Card>
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Coins className="size-5" />
                            <span className="font-medium">Main Quest</span>
                          </div>
                          <span className="text-sm font-semibold">
                            64 / 100 Coins
                          </span>
                        </div>
                        <Progress
                          value={64}
                          aria-label="สะสม 64 จาก 100 Coins"
                        />
                        <p className="text-sm text-muted-foreground">
                          อีก 36 Coins รับวงเงินช่วยจ่ายเพิ่ม ฿100
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate("quest")}
                        >
                          ดูภารกิจของฉัน
                          <ChevronRight className="size-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Section>
                  <Section
                    title="ลองร้านใหม่ในชุมชน"
                    subtitle="ตัวอย่างร้านที่คุณยังไม่เคยซื้อ"
                  >
                    {shopCards()}
                  </Section>
                </>
              )}
            </>
          )}
          {tab === "explore" && <NearbyStores />}
          {tab === "quest" && !seller && (
            <CustomerMainQuest onExplore={() => navigate("explore")} />
          )}
          {false && tab === "receive" && (
            <Section
              title="รับเงินจากลูกค้า"
              subtitle="สร้างหน้ารับเงินตัวอย่างสำหรับร้านของคุณ"
            >
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setQr(true);
                }}
              >
                <label className="block space-y-2 text-sm">
                  <span>ยอดซื้อ (บาท)</span>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setQr(false);
                    }}
                    placeholder="0.00"
                    className="h-14 text-xl"
                  />
                </label>
                <Button className="w-full" type="submit">
                  สร้างหน้ารับเงิน
                </Button>
              </form>
              {qr && (
                <Card>
                  <CardContent className="space-y-4 p-6 text-center">
                    <div className="mx-auto flex size-40 items-center justify-center rounded-xl bg-muted">
                      <QrCode className="size-28" strokeWidth={1} />
                    </div>
                    <Badge variant="outline">
                      ภาพประกอบ QR • สแกนชำระไม่ได้
                    </Badge>
                    <p className="text-xl font-semibold">
                      ฿
                      {Number(amount).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {storeName} • ต้นแบบหน้ารับเงิน
                    </p>
                  </CardContent>
                </Card>
              )}
            </Section>
          )}
          {tab === "manage" && (
            <Section
              title="จัดการร้านของฉัน"
              subtitle="ข้อมูลนี้จะแสดงให้ลูกค้าเห็นบนหน้าค้นหาร้าน"
            >
              <Badge variant="secondary">
                <Check className="mr-1 size-3" />
                สถานะตัวอย่าง: อนุมัติแล้ว
              </Badge>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setNotice(
                    "บันทึกข้อมูลร้านในหน้าต้นแบบแล้ว ข้อมูลจะรีเซ็ตเมื่อโหลดหน้าใหม่",
                  );
                }}
              >
                {[
                  { label: "ชื่อร้าน", value: storeName, set: setStoreName },
                  {
                    label: "หมวดสินค้า",
                    value: storeCategory,
                    set: setStoreCategory,
                  },
                  { label: "ที่ตั้ง / พื้นที่", value: area, set: setArea },
                  { label: "เวลาเปิดทำการ", value: hours, set: setHours },
                ].map((field) => (
                  <label key={field.label} className="block space-y-2 text-sm">
                    <span>{field.label}</span>
                    <Input
                      required
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                    />
                  </label>
                ))}
                <Button type="submit" className="w-full">
                  บันทึกข้อมูลร้าน
                </Button>
              </form>
              <Card>
                <CardContent className="space-y-2 p-5">
                  <h3 className="font-medium">กติกา Coins ของร้าน</h3>
                  <p className="text-sm text-muted-foreground">
                    ร้านใหม่สำหรับลูกค้า: 8–10 Coins ตามเกณฑ์ตัวอย่าง
                    <br />
                    ร้านเดิมที่เคยได้รับ Coins: 1 Coin
                    <br />
                    ระบบคำนวณและกำหนดตามกติกา ไม่สามารถแก้ไขจากร้านค้า
                  </p>
                </CardContent>
              </Card>
            </Section>
          )}
          {tab === "profile" && (
            <Section title="บัญชีของฉัน">
              <Card>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-full bg-muted p-4">
                    <User className="size-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {seller ? "บัญชีร้านค้า" : "ผู้ใช้ทั่วไป"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              {[
                "ข้อมูลส่วนตัว",
                "สิทธิประโยชน์และเงื่อนไข",
                "ความช่วยเหลือ",
              ].map((label) => (
                <Button
                  key={label}
                  variant="outline"
                  className="h-14 w-full justify-between"
                  onClick={() =>
                    setNotice(`${label}: ส่วนนี้เตรียมไว้สำหรับพัฒนาต่อ`)
                  }
                >
                  {label}
                  <ChevronRight className="size-4" />
                </Button>
              ))}
              <div className="flex justify-end">
                <LogoutButton />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                THAI Please • Base UI v0.1
                <br />
                ยอดเงินและข้อมูลธุรกรรมยังเป็นตัวอย่าง
              </p>
            </Section>
          )}
          {(!livePage || tab === "explore") && (
            <p className="text-center text-[11px] text-muted-foreground">
              {tab === "explore"
                ? "ร้านที่อนุมัติแล้ว เรียงตามระยะห่างจากพิกัดที่ค้นหา"
                : "ข้อมูลและยอดทั้งหมดเป็นตัวอย่างสำหรับออกแบบ UI"}
            </p>
          )}
        </main>
        <nav
          aria-label="เมนูหลัก"
          className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-lg -translate-x-1/2 border-t bg-background/95 px-2 pt-2 backdrop-blur"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          {nav.map((n) => (
            <Link
              key={n.id}
              href={routes[n.id]}
              aria-current={tab === n.id ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[10px] transition-colors ${tab === n.id ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}
            >
              <n.icon className="size-5" strokeWidth={tab === n.id ? 2 : 1.5} />
              {n.label}
            </Link>
          ))}
        </nav>
        <Dialog
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        >
          <DialogContent>
            {selected && (
              <>
                <span className="text-4xl">{selected.icon}</span>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.description} · {selected.distance}
                </DialogDescription>
                <Badge variant="secondary">
                  ร้านใหม่สำหรับคุณ • +{selected.coins} Coins ตัวอย่าง
                </Badge>
                <p className="text-sm">
                  เวลาเปิด 08:00–18:00 • เข้าร่วมโครงการแล้ว
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelected(null);
                    setNotice(
                      "เตรียมหน้าชำระเงินสำหรับเชื่อม API ในขั้นถัดไป ยังไม่มีการตัดเงิน",
                    );
                  }}
                >
                  ดูขั้นตอนชำระเงิน
                  <ArrowUpRight />
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
