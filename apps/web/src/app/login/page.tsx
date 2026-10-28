"use client";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/use-login";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
const tabs = [
  { role: "CUSTOMER", label: "ลูกค้า" },
  { role: "SELLER", label: "ร้านค้า" },
  { role: "GOVERNMENT", label: "ภาครัฐ" },
] as const;
const schema = z
  .object({
    role: z.enum(["CUSTOMER", "SELLER", "GOVERNMENT"]),
    username: z.string().trim().min(1, "กรุณากรอกชื่อผู้ใช้").max(255),
    password: z.string().min(1, "กรุณากรอกรหัสผ่าน").max(1024),
  })
  .superRefine((value, ctx) => {
    if (value.role === "CUSTOMER" && !/^[0-9]{13}$/.test(value.username))
      ctx.addIssue({
        code: "custom",
        path: ["username"],
        message: "กรุณากรอกเลขบัตรประชาชน 13 หลัก",
      });
  });
type Values = z.infer<typeof schema>;
export default function LoginPage() {
  const { login, loading, clearError } = useLogin();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { role: "CUSTOMER", username: "", password: "" },
  });
  const role = useWatch({ control, name: "role" });
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-12">
      <section
        className="w-full max-w-md rounded-3xl border bg-background p-6 shadow-sm sm:p-8"
        aria-labelledby="login-title"
      >
        <p className="mb-2 text-sm font-semibold text-muted-foreground">
          THAI Please
        </p>
        <h1 id="login-title" className="text-2xl font-bold">
          เข้าสู่ระบบ
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          เลือกประเภทบัญชีเพื่อเริ่มใช้งาน
        </p>
        <div
          className="mt-6 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
          role="tablist"
          aria-label="ประเภทบัญชี"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.role}
              id={`tab-${tab.role}`}
              type="button"
              role="tab"
              aria-selected={role === tab.role}
              aria-controls="login-panel"
              tabIndex={role === tab.role ? 0 : -1}
              disabled={isSubmitting || loading}
              className={`rounded-lg px-2 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring ${role === tab.role ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              onClick={() => {
                reset({ role: tab.role, username: "", password: "" });
                clearError();
              }}
              onKeyDown={(event) => {
                const delta =
                  event.key === "ArrowRight"
                    ? 1
                    : event.key === "ArrowLeft"
                      ? -1
                      : 0;
                if (!delta && event.key !== "Home" && event.key !== "End")
                  return;
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? tabs[0]
                    : event.key === "End"
                      ? tabs[2]
                      : tabs[(index + delta + 3) % 3];
                reset({ role: next.role, username: "", password: "" });
                clearError();
                document.getElementById(`tab-${next.role}`)?.focus();
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form
          method="post"
          id="login-panel"
          role="tabpanel"
          aria-labelledby={`tab-${role}`}
          className="mt-6 space-y-5"
          onSubmit={handleSubmit(login, (validationErrors) => {
            const message =
              validationErrors.username?.message ??
              validationErrors.password?.message ??
              "กรุณาตรวจสอบข้อมูลเข้าสู่ระบบ";
            toast.error("ข้อมูลไม่ถูกต้อง", { description: message });
          })}
          noValidate
        >
          <input type="hidden" {...register("role")} />
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              {role === "CUSTOMER" ? "เลขบัตรประชาชน" : "ชื่อผู้ใช้"}
            </label>
            <Input
              id="username"
              {...register("username")}
              type="text"
              inputMode={role === "CUSTOMER" ? "numeric" : "text"}
              maxLength={role === "CUSTOMER" ? 13 : 255}
              autoComplete="username"
              placeholder={
                role === "CUSTOMER"
                  ? "เลขบัตรประชาชน 13 หลัก"
                  : "กรอกชื่อผู้ใช้"
              }
              aria-invalid={!!errors.username}
              disabled={isSubmitting || loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              รหัสผ่าน
            </label>
            <Input
              id="password"
              {...register("password")}
              type="password"
              placeholder="กรอกรหัสผ่าน"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              disabled={isSubmitting || loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loading}
          >
            {(isSubmitting || loading) && (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {isSubmitting || loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline underline-offset-4"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </section>
    </main>
  );
}
