"use client";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useRegister } from "@/hooks/use-register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShopLocationPicker } from "@/components/maps/shop-location-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
const roles = [
  { role: "CUSTOMER", label: "ลูกค้า" },
  { role: "SELLER", label: "ร้านค้า" },
  { role: "GOVERNMENT", label: "ภาครัฐ" },
] as const;
const schema = z
  .object({
    role: z.enum(["CUSTOMER", "SELLER", "GOVERNMENT"]),
    firstName: z.string(),
    lastName: z.string(),
    shopName: z.string(),
    category: z.string(),
    areaCode: z.string(),
    address: z.string(),
    latitude: z.string(),
    longitude: z.string(),
    openingHours: z.string(),
    sizeClass: z.enum(["SMALL", "MEDIUM", "LARGE"]),
    username: z.string().trim().min(1, "กรุณากรอกชื่อผู้ใช้"),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .max(128, "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร"),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  })
  .superRefine((v, ctx) => {
    const issue = (name: keyof typeof v, message: string) =>
      ctx.addIssue({ code: "custom", path: [name], message });
    if (
      v.role === "CUSTOMER"
        ? !/^[0-9]{13}$/.test(v.username)
        : !/^[A-Za-z0-9_.-]{3,64}$/.test(v.username)
    )
      issue(
        "username",
        v.role === "CUSTOMER"
          ? "กรุณากรอกเลขบัตรประชาชน 13 หลัก"
          : "ชื่อผู้ใช้ต้องมี 3–64 ตัว ใช้ a-z, A-Z, 0-9, จุด ขีดกลาง หรือขีดล่าง",
      );
    if (v.password !== v.confirmPassword)
      issue("confirmPassword", "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
    if (v.role === "CUSTOMER") {
      if (!v.firstName.trim() || v.firstName.trim().length > 100)
        issue("firstName", "กรุณากรอกชื่อ ไม่เกิน 100 ตัวอักษร");
      if (!v.lastName.trim() || v.lastName.trim().length > 99)
        issue("lastName", "กรุณากรอกนามสกุล ไม่เกิน 99 ตัวอักษร");
    }
    if (v.role === "SELLER") {
      for (const [key, label, max] of [
        ["shopName", "ชื่อร้าน", 200],
        ["category", "หมวดหมู่ร้าน", 100],
        ["areaCode", "รหัสพื้นที่", 20],
        ["address", "ที่อยู่ร้าน", 500],
        ["openingHours", "เวลาเปิด–ปิด", 500],
      ] as const)
        if (!v[key].trim() || v[key].trim().length > max)
          issue(key, `กรุณากรอก${label} ไม่เกิน ${max} ตัวอักษร`);
      if (
        !v.latitude.trim() ||
        !Number.isFinite(Number(v.latitude)) ||
        Math.abs(Number(v.latitude)) > 90
      )
        issue("latitude", "กรุณากรอกละติจูด -90 ถึง 90");
      if (
        !v.longitude.trim() ||
        !Number.isFinite(Number(v.longitude)) ||
        Math.abs(Number(v.longitude)) > 180
      )
        issue("longitude", "กรุณากรอกลองจิจูด -180 ถึง 180");
    }
  });
const defaults = {
  role: "CUSTOMER" as const,
  firstName: "",
  lastName: "",
  shopName: "",
  category: "",
  areaCode: "",
  address: "",
  latitude: "",
  longitude: "",
  openingHours: "",
  sizeClass: "SMALL" as const,
  username: "",
  password: "",
  confirmPassword: "",
};
type Values = z.infer<typeof schema>;
export default function RegisterPage() {
  const { register: submit, loading } = useRegister();
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const role = useWatch({ control, name: "role" });
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const pending = loading || isSubmitting;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-10">
      <section
        className="w-full max-w-md space-y-6 rounded-3xl border bg-background p-6 shadow-sm sm:p-8"
        aria-labelledby="register-title"
      >
        <div>
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            THAI Please
          </p>
          <h1 id="register-title" className="text-2xl font-bold">
            สมัครสมาชิก
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            เลือกประเภทบัญชีที่ต้องการสมัคร
          </p>
        </div>
        <div
          role="tablist"
          aria-label="ประเภทบัญชี"
          className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
        >
          {roles.map((item, index) => (
            <button
              key={item.role}
              id={`register-${item.role}`}
              role="tab"
              type="button"
              aria-selected={role === item.role}
              aria-controls="register-form"
              tabIndex={role === item.role ? 0 : -1}
              disabled={pending}
              className={`rounded-lg px-2 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring ${role === item.role ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              onClick={() => reset({ ...defaults, role: item.role })}
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
                    ? roles[0]
                    : event.key === "End"
                      ? roles[2]
                      : roles[(index + delta + 3) % 3];
                reset({ ...defaults, role: next.role });
                document.getElementById(`register-${next.role}`)?.focus();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <form
          id="register-form"
          role="tabpanel"
          aria-labelledby={`register-${role}`}
          className="space-y-5"
          noValidate
          onSubmit={handleSubmit(
            (values) =>
              submit({
                role: values.role,
                username: values.username,
                password: values.password,
                confirmPassword: values.confirmPassword,
                ...(values.role === "CUSTOMER"
                  ? {
                      firstName: values.firstName.trim(),
                      lastName: values.lastName.trim(),
                    }
                  : {}),
                ...(values.role === "SELLER"
                  ? {
                      shop: {
                        name: values.shopName.trim(),
                        category: values.category.trim(),
                        areaCode: values.areaCode.trim(),
                        address: values.address.trim(),
                        latitude: Number(values.latitude),
                        longitude: Number(values.longitude),
                        openingHours: values.openingHours.trim(),
                        sizeClass: values.sizeClass,
                      },
                    }
                  : {}),
              }),
            (issues) =>
              toast.error("ข้อมูลไม่ถูกต้อง", {
                description:
                  Object.values(issues).find((issue) => issue?.message)
                    ?.message ?? "กรุณาตรวจสอบข้อมูล",
              }),
          )}
        >
          <input type="hidden" {...register("role")} />
          {role !== "GOVERNMENT" && (
            <fieldset className="space-y-4">
              <legend className="mb-3 font-semibold">
                {role === "CUSTOMER" ? "ข้อมูลส่วนตัว" : "ข้อมูลร้านค้า"}
              </legend>
              {role === "SELLER" && (
                <ShopLocationPicker
                  latitude={latitude}
                  longitude={longitude}
                  disabled={pending}
                  onChange={(lat, lng) => {
                    setValue("latitude", lat, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setValue("longitude", lng, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              )}
              {(role === "CUSTOMER"
                ? ([
                    { name: "firstName", label: "ชื่อ", max: 100 },
                    { name: "lastName", label: "นามสกุล", max: 99 },
                  ] as const)
                : ([
                    { name: "shopName", label: "ชื่อร้าน", max: 200 },
                    { name: "category", label: "หมวดหมู่ร้าน", max: 100 },
                    { name: "areaCode", label: "รหัสพื้นที่", max: 20 },
                    {
                      name: "address",
                      label:
                        "ที่อยู่ร้าน (บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด)",
                      max: 500,
                    },
                    {
                      name: "latitude",
                      label: "ละติจูด (-90 ถึง 90)",
                      max: 20,
                    },
                    {
                      name: "longitude",
                      label: "ลองจิจูด (-180 ถึง 180)",
                      max: 20,
                    },
                    {
                      name: "openingHours",
                      label: "เวลาเปิด–ปิด เช่น จันทร์–ศุกร์ 08:00–18:00",
                      max: 500,
                    },
                  ] as const)
              ).map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {field.label}
                  </label>
                  <Input
                    id={field.name}
                    {...register(field.name)}
                    placeholder={field.label}
                    maxLength={field.max}
                    aria-invalid={!!errors[field.name]}
                    disabled={pending}
                    inputMode={
                      field.name === "latitude" || field.name === "longitude"
                        ? "decimal"
                        : "text"
                    }
                    autoComplete={
                      field.name === "firstName"
                        ? "given-name"
                        : field.name === "lastName"
                          ? "family-name"
                          : "off"
                    }
                  />
                </div>
              ))}
              {role === "SELLER" && (
                <div className="space-y-2">
                  <label htmlFor="sizeClass" className="text-sm font-medium">
                    ขนาดร้าน
                  </label>
                  <Controller
                    name="sizeClass"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={(value) => {
                          if (value) field.onChange(value);
                        }}
                        disabled={pending}
                        items={{
                          SMALL: "ขนาดเล็ก",
                          MEDIUM: "ขนาดกลาง",
                          LARGE: "ขนาดใหญ่",
                        }}
                      >
                        <SelectTrigger
                          id="sizeClass"
                          ref={field.ref}
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                          className="min-h-11 w-full"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SMALL">ขนาดเล็ก</SelectItem>
                          <SelectItem value="MEDIUM">ขนาดกลาง</SelectItem>
                          <SelectItem value="LARGE">ขนาดใหญ่</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    ร้านที่สมัครจะอยู่ในสถานะรออนุมัติ
                  </p>
                </div>
              )}
            </fieldset>
          )}

          {(
            [
              {
                name: "username",
                label: role === "CUSTOMER" ? "เลขบัตรประชาชน" : "ชื่อผู้ใช้",
                type: "text",
                placeholder:
                  role === "CUSTOMER"
                    ? "เลขบัตรประชาชน 13 หลัก"
                    : "ชื่อผู้ใช้ 3–64 ตัวอักษร",
                autoComplete: "username",
                maxLength: role === "CUSTOMER" ? 13 : 64,
              },
              {
                name: "password",
                label: "รหัสผ่าน",
                type: "password",
                placeholder: "รหัสผ่าน 8–128 ตัวอักษร",
                autoComplete: "new-password",
                maxLength: 128,
              },
              {
                name: "confirmPassword",
                label: "ยืนยันรหัสผ่าน",
                type: "password",
                placeholder: "กรอกรหัสผ่านอีกครั้ง",
                autoComplete: "new-password",
                maxLength: 128,
              },
            ] as const
          ).map((field) => (
            <div key={field.name} className="space-y-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </label>
              <Input
                id={field.name}
                {...register(field.name)}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                maxLength={field.maxLength}
                inputMode={
                  field.name === "username" && role === "CUSTOMER"
                    ? "numeric"
                    : "text"
                }
                aria-invalid={!!errors[field.name]}
                disabled={pending}
              />
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {pending ? "กำลังสมัครสมาชิก…" : "สมัครสมาชิก"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          มีบัญชีแล้ว?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </section>
    </main>
  );
}
