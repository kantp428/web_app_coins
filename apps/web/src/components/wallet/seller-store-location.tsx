"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  getApiError,
  getSellerStores,
  updateSellerStoreLocation,
  type ShopAddress,
} from "@/lib/api";
import {
  emptyShopAddress,
  sellerLocationFormSchema,
  type SellerStore,
  type SellerLocationForm,
} from "@/lib/seller-store-contract";
import { useReverseGeocode } from "@/hooks/use-reverse-geocode";
import { ShopLocationPicker } from "@/components/maps/shop-location-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const addressLabels = {
  line1: "บ้านเลขที่/อาคาร/ถนน",
  province: "จังหวัด",
  district: "เขต/อำเภอ",
  subDistrict: "แขวง/ตำบล",
  postcode: "รหัสไปรษณีย์",
};
const statuses = {
  PENDING: "รออนุมัติ",
  APPROVED: "อนุมัติแล้ว",
  SUSPENDED: "ถูกระงับ",
  REJECTED: "ไม่อนุมัติ",
};

export function SellerStoreLocation() {
  const [stores, setStores] = useState<SellerStore[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    getSellerStores(controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setStores(rows);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setFailed(true);
          toast.error(getApiError(error));
        }
      });
    return () => controller.abort();
  }, [attempt]);
  const selected =
    stores?.find((store) => store.id === selectedId) ?? stores?.[0];
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">ตำแหน่งร้านของฉัน</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          เลือกตำแหน่งปัจจุบันหรือปักหมุดร้านเอง
          แล้วตรวจสอบพิกัดและที่อยู่ก่อนบันทึก
        </p>
      </div>
      {failed ? (
        <Button
          variant="outline"
          onClick={() => {
            setFailed(false);
            setStores(null);
            setAttempt((value) => value + 1);
          }}
        >
          โหลดข้อมูลร้านใหม่
        </Button>
      ) : stores === null ? (
        <p role="status" className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลร้าน…
        </p>
      ) : !selected ? (
        <p className="rounded-xl border p-4 text-sm">ไม่พบร้านในบัญชีนี้</p>
      ) : (
        <>
          {stores.length > 1 && (
            <div className="space-y-1 text-sm">
              <span id="seller-shop-label">เลือกร้านที่ต้องการแก้ไข</span>
              <Select
                items={stores.map((store) => ({
                  value: store.id,
                  label: store.name,
                }))}
                value={selected.id}
                onValueChange={(value) => {
                  if (value) setSelectedId(value);
                }}
                disabled={saving}
              >
                <SelectTrigger
                  className="w-full"
                  aria-labelledby="seller-shop-label"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{selected.name}</h3>
            <Badge variant="secondary">
              {statuses[selected.participationStatus]}
            </Badge>
          </div>
          <LocationForm
            key={selected.id}
            store={selected}
            saving={saving}
            onSaving={setSaving}
            onSaved={(saved) =>
              setStores(
                (current) =>
                  current?.map((store) =>
                    store.id === saved.id ? saved : store,
                  ) ?? null,
              )
            }
          />
        </>
      )}
    </section>
  );
}

function LocationForm({
  store,
  saving,
  onSaving,
  onSaved,
}: {
  store: SellerStore;
  saving: boolean;
  onSaving: (value: boolean) => void;
  onSaved: (store: SellerStore) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<SellerLocationForm>({
    resolver: zodResolver(sellerLocationFormSchema),
    defaultValues: {
      latitude: store.latitude,
      longitude: store.longitude,
      ...emptyShopAddress,
      ...store.address,
    },
  });
  const latitude = useWatch({ control, name: "latitude" }),
    longitude = useWatch({ control, name: "longitude" });
  const [edited, setEdited] = useState(false);
  const [locating, setLocating] = useState(false);
  const applyAddress = useCallback(
    (address: ShopAddress) => {
      for (const key of Object.keys(emptyShopAddress) as (keyof ShopAddress)[])
        setValue(key, address[key] ?? "", {
          shouldDirty: true,
          shouldValidate: true,
        });
    },
    [setValue],
  );
  const { loading: addressLoading, retry } = useReverseGeocode(
    latitude,
    longitude,
    edited && !saving,
    applyAddress,
  );
  function clearAddress() {
    for (const key of Object.keys(emptyShopAddress) as (keyof ShopAddress)[])
      setValue(key, "", { shouldDirty: true });
    setEdited(true);
  }
  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        onSaving(true);
        try {
          const address = {
            line1: values.line1,
            province: values.province,
            district: values.district,
            subDistrict: values.subDistrict,
            postcode: values.postcode,
          };
          const saved = await updateSellerStoreLocation(store.id, {
            latitude: values.latitude,
            longitude: values.longitude,
            address: Object.values(address).some((value) => value.trim())
              ? address
              : null,
          });
          setEdited(false);
          reset({
            latitude: saved.latitude,
            longitude: saved.longitude,
            ...emptyShopAddress,
            ...saved.address,
          });
          onSaved(saved);
          toast.success("บันทึกตำแหน่งร้านแล้ว");
        } catch (error) {
          toast.error(getApiError(error));
        } finally {
          onSaving(false);
        }
      })}
    >
      <fieldset disabled={saving || locating} className="min-w-0 space-y-4">
        <ShopLocationPicker
          latitude={latitude}
          longitude={longitude}
          disabled={saving}
          onLocatingChange={setLocating}
          onChange={(lat, lng) => {
            if (saving) return;
            if (lat !== latitude || lng !== longitude) clearAddress();
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
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["latitude", "ละติจูด"],
              ["longitude", "ลองจิจูด"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="min-w-0 space-y-1 text-sm">
              <span>{label}</span>
              <Input
                {...register(key, { onChange: clearAddress })}
                inputMode="decimal"
                aria-invalid={!!errors[key]}
              />
              <span className="text-xs text-destructive">
                {errors[key]?.message}
              </span>
            </label>
          ))}
        </div>
        {addressLoading && (
          <p role="status" className="text-sm text-muted-foreground">
            กำลังค้นหาที่อยู่จากพิกัด…
          </p>
        )}
        {edited && !addressLoading && (
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            ค้นหาที่อยู่จากพิกัดอีกครั้ง
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          แก้ไขที่อยู่เองได้ หากค้นหาที่อยู่อัตโนมัติไม่สำเร็จ
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(addressLabels) as (keyof ShopAddress)[]).map((key) => (
            <label
              key={key}
              className={`space-y-1 text-sm ${key === "line1" ? "sm:col-span-2" : ""}`}
            >
              <span>{addressLabels[key]}</span>
              <Input
                {...register(key)}
                maxLength={key === "line1" ? 500 : key === "postcode" ? 5 : 100}
                inputMode={key === "postcode" ? "numeric" : undefined}
                aria-invalid={!!errors[key]}
              />
              <span className="text-xs text-destructive">
                {errors[key]?.message}
              </span>
            </label>
          ))}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={saving || locating || addressLoading || !isDirty}
        >
          {saving ? "กำลังบันทึก…" : "บันทึกตำแหน่งร้าน"}
        </Button>
      </fieldset>
    </form>
  );
}
