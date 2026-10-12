"use client";
import { ShopCategorySelect } from "@/components/maps/shop-category-select";
import { ShopLocationPicker } from "@/components/maps/shop-location-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { useRegister } from "@/hooks/use-register";
import { useReverseGeocode } from "@/hooks/use-reverse-geocode";
import type { ShopAddress } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { ShopOpeningHours } from "@/components/maps/shop-opening-hours";
import { useCallback } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
    shopDescription: z.string(),
    categoryIds: z.array(z.string()),
    address: z.string(),
    province: z.string(),
    district: z.string(),
    subDistrict: z.string(),
    postcode: z.string(),
    latitude: z.string(),
    longitude: z.string(),
    openingDays: z.array(z.string()),
    openTime: z.string(),
    closeTime: z.string(),
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
      if (!v.shopDescription.trim() || v.shopDescription.trim().length > 2000)
        issue("shopDescription", "กรุณากรอกรายละเอียดร้าน 1–2,000 ตัวอักษร");
      for (const [key, label, max] of [["shopName", "ชื่อร้าน", 200]] as const)
        if (!v[key].trim() || v[key].trim().length > max)
          issue(key, `กรุณากรอก${label} ไม่เกิน ${max} ตัวอักษร`);
      if (!v.openingDays.length)
        issue("openingDays", "กรุณาเลือกวันที่ร้านเปิด");
      const time = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
      if (
        !time.test(v.openTime) ||
        !time.test(v.closeTime) ||
        v.openTime === v.closeTime
      )
        issue("openTime", "กรุณาระบุเวลาเปิด–ปิดให้ถูกต้องและไม่เท่ากัน");
      if (!v.categoryIds.length || v.categoryIds.length > 10)
        issue("categoryIds", "กรุณาเลือกหมวดหมู่ร้าน 1–10 หมวด");
      for (const key of [
        "address",
        "province",
        "district",
        "subDistrict",
      ] as const)
        if (v[key].length > (key === "address" ? 500 : 100))
          issue(key, "ข้อมูลที่อยู่ยาวเกินกำหนด กรุณาเลือกตำแหน่งใหม่");
      if (
        ![v.address, v.province, v.district, v.subDistrict, v.postcode].some(
          (value) => value.trim(),
        )
      )
        issue(
          "address",
          "กรุณาเลือกตำแหน่งบนแผนที่และรอข้อมูลที่อยู่ หรือกดเติมที่อยู่อีกครั้ง",
        );
      if (v.postcode && !/^[0-9]{5}$/.test(v.postcode))
        issue("postcode", "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก");
      if (
        !v.latitude.trim() ||
        !Number.isFinite(Number(v.latitude)) ||
        Math.abs(Number(v.latitude)) > 90
      )
        issue("latitude", "กรุณาเลือกตำแหน่งร้านบนแผนที่");
      if (
        !v.longitude.trim() ||
        !Number.isFinite(Number(v.longitude)) ||
        Math.abs(Number(v.longitude)) > 180
      )
        issue("longitude", "กรุณาเลือกตำแหน่งร้านบนแผนที่");
    }
  });
const defaults = {
  role: "CUSTOMER" as const,
  firstName: "",
  lastName: "",
  shopName: "",
  shopDescription: "",
  categoryIds: [] as string[],
  address: "",
  province: "",
  district: "",
  subDistrict: "",
  postcode: "",
  latitude: "",
  longitude: "",
  openingDays: [] as string[],
  openTime: "08:00",
  closeTime: "18:00",
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
  const location = useWatch({
    control,
    name: [
      "address",
      "province",
      "district",
      "subDistrict",
      "postcode",
      "latitude",
      "longitude",
    ],
  });
  const applyAddress = useCallback(
    (address: ShopAddress) => {
      setValue("address", address.line1, { shouldDirty: true });
      for (const key of [
        "province",
        "district",
        "subDistrict",
        "postcode",
      ] as const)
        setValue(key, address[key], { shouldDirty: true });
    },
    [setValue],
  );
  const { loading: geocoding } = useReverseGeocode(
    latitude,
    longitude,
    role === "SELLER",
    applyAddress,
  );
  const {
    categories,
    loading: categoriesLoading,
    retry: retryCategories,
  } = useCategories(role === "SELLER");
  const pending = loading || isSubmitting || geocoding;
  const openingDays = useWatch({ control, name: "openingDays" });
  const openTime = useWatch({ control, name: "openTime" });
  const closeTime = useWatch({ control, name: "closeTime" });
  const selectedCategoryIds = useWatch({ control, name: "categoryIds" });
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
                        description: values.shopDescription.trim(),
                        categoryIds: values.categoryIds,
                        address: {
                          line1: values.address.trim(),
                          province: values.province.trim(),
                          district: values.district.trim(),
                          subDistrict: values.subDistrict.trim(),
                          postcode: values.postcode.trim(),
                        },
                        latitude: Number(values.latitude),
                        longitude: Number(values.longitude),
                        openingHours: {
                          days: values.openingDays,
                          open: values.openTime,
                          close: values.closeTime,
                          timeZone: "Asia/Bangkok",
                        },
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
          {geocoding && (
            <p role="status" className="text-sm text-muted-foreground">
              กำลังเติมที่อยู่จากพิกัด…
            </p>
          )}
          {role !== "GOVERNMENT" && (
            <fieldset className="space-y-4">
              <legend className="mb-3 font-semibold">
                {role === "CUSTOMER" ? "ข้อมูลส่วนตัว" : "ข้อมูลร้านค้า"}
              </legend>
              {(role === "CUSTOMER"
                ? ([
                    { name: "firstName", label: "ชื่อ", max: 100 },
                    { name: "lastName", label: "นามสกุล", max: 99 },
                  ] as const)
                : ([{ name: "shopName", label: "ชื่อร้าน", max: 200 }] as const)
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
                    inputMode="text"
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
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="shopDescription"
                      className="text-sm font-medium"
                    >
                      รายละเอียดร้าน
                    </label>
                    <Textarea
                      id="shopDescription"
                      {...register("shopDescription")}
                      maxLength={2000}
                      rows={4}
                      placeholder="ร้านอาหารอีสานทั่วไป ส้มตำ ลาบ ก้อย ไก่ย่าง คอหมูย่าง ปลาดุกย่าง"
                      aria-describedby="shop-description-help"
                      aria-invalid={!!errors.shopDescription}
                      disabled={pending}
                    />
                    <p
                      id="shop-description-help"
                      className="text-xs text-muted-foreground"
                    >
                      อธิบายประเภทอาหาร เมนู สินค้าหรือบริการเด่น
                      เพื่อช่วยแนะนำร้านให้ลูกค้า (ไม่เกิน 2,000 ตัวอักษร)
                    </p>
                  </div>
                  <ShopOpeningHours
                    days={openingDays}
                    open={openTime}
                    close={closeTime}
                    disabled={pending}
                    onDaysChange={(value) =>
                      setValue("openingDays", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onOpenChange={(value) =>
                      setValue("openTime", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onCloseChange={(value) =>
                      setValue("closeTime", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </>
              )}
              {role === "SELLER" && (
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">
                    หมวดหมู่ร้าน (เลือกได้หลายหมวด)
                  </legend>
                  {categoriesLoading && (
                    <p role="status" className="text-sm text-muted-foreground">
                      กำลังโหลดหมวดหมู่…
                    </p>
                  )}
                  <ShopCategorySelect
                    categories={categories}
                    value={selectedCategoryIds}
                    disabled={pending || categoriesLoading}
                    invalid={!!errors.categoryIds}
                    onChange={(ids) =>
                      setValue("categoryIds", ids, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  {!categoriesLoading && !categories.length && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={pending}
                      onClick={retryCategories}
                    >
                      โหลดหมวดหมู่อีกครั้ง
                    </Button>
                  )}
                </fieldset>
              )}
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
              {role === "SELLER" && (
                <dl
                  className="space-y-3 rounded-xl bg-muted/50 p-4 text-sm"
                  aria-label="ที่อยู่ร้านจากแผนที่"
                  aria-live="polite"
                >
                  {[
                    "บ้านเลขที่/อาคาร/ถนน",
                    "จังหวัด",
                    "เขต/อำเภอ",
                    "แขวง/ตำบล",
                    "รหัสไปรษณีย์",
                    "ละติจูด",
                    "ลองจิจูด",
                  ].map((label, index) => (
                    <div key={label} className="space-y-1">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd
                        className={
                          index >= 5
                            ? "wrap-break-word font-mono"
                            : "wrap-break-word font-medium"
                        }
                      >
                        {location[index] || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
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
          <Button
            type="submit"
            className="w-full"
            disabled={
              pending ||
              (role === "SELLER" && (categoriesLoading || !categories.length))
            }
          >
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
