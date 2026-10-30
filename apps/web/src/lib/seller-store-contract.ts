import { z } from "zod";

export const ownedShopIdSchema = z
  .string()
  .regex(/^[1-9]\d{0,18}$/)
  .refine(
    (value) =>
      /^[1-9]\d{0,18}$/.test(value) &&
      BigInt(value) <= BigInt("9223372036854775807"),
  );
const coordinate = (limit: number) =>
  z
    .string()
    .trim()
    .regex(/^-?\d+(\.\d+)?$/, "กรุณากรอกพิกัดเป็นตัวเลข")
    .refine(
      (value) =>
        Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit,
      "พิกัดอยู่นอกขอบเขต",
    );
export const shopAddressSchema = z
  .object({
    line1: z.string().trim().max(500),
    province: z.string().trim().max(100),
    district: z.string().trim().max(100),
    subDistrict: z.string().trim().max(100),
    postcode: z
      .string()
      .trim()
      .regex(/^(\d{5})?$/, "รหัสไปรษณีย์ต้องมี5หลัก"),
  })
  .strict();
export const sellerLocationSchema = z
  .object({
    latitude: coordinate(90),
    longitude: coordinate(180),
    address: shopAddressSchema.nullable(),
  })
  .strict();
export const sellerLocationFormSchema = z.object({
  latitude: coordinate(90),
  longitude: coordinate(180),
  ...shopAddressSchema.shape,
});
export const sellerStoreSchema = z
  .object({
    id: ownedShopIdSchema,
    name: z.string(),
    latitude: coordinate(90),
    longitude: coordinate(180),
    address: shopAddressSchema.nullable(),
    participationStatus: z.enum([
      "PENDING",
      "APPROVED",
      "SUSPENDED",
      "REJECTED",
    ]),
  })
  .strict();
export const sellerStoresSchema = z
  .object({ stores: z.array(sellerStoreSchema) })
  .strict();
export type SellerStore = z.infer<typeof sellerStoreSchema>;
export type SellerLocation = z.infer<typeof sellerLocationSchema>;
export type SellerLocationForm = z.infer<typeof sellerLocationFormSchema>;
export const emptyShopAddress = {
  line1: "",
  province: "",
  district: "",
  subDistrict: "",
  postcode: "",
};
