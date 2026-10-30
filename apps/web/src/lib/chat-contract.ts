import { z } from "zod";
import { storeCoinRateSchema } from "./store-coin-rate";

const identifier = z
  .string()
  .regex(/^[1-9]\d{0,18}$/)
  .refine(
    (value) =>
      /^[1-9]\d{0,18}$/.test(value) &&
      BigInt(value) <= BigInt("9223372036854775807"),
  );
export const chatLocationSchema = z
  .object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    radiusKm: z.number().finite().min(0.1).max(50),
  })
  .strict();
export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "กรุณาพิมพ์ข้อความ")
    .max(2000, "ข้อความยาวได้ไม่เกิน 2,000 ตัวอักษร"),
});
export const chatRequestSchema = chatMessageSchema
  .extend({
    location: chatLocationSchema.optional(),
  })
  .strict()
  .transform(({ message }) => ({ message }));
export const chatStoreRequestSchema = z
  .object({
    shopIds: z
      .array(identifier)
      .max(5)
      .refine((ids) => new Set(ids).size === ids.length),
  })
  .strict();
export const chatReplySchema = z
  .object({
    reply: z.string().trim().min(1),
    storeIds: z
      .array(identifier)
      .max(5)
      .refine((ids) => new Set(ids).size === ids.length),
    sources: z
      .array(
        z
          .object({
            title: z.string(),
            url: z
              .string()
              .url()
              .refine((value) => {
                try {
                  const url = new URL(value);
                  return (
                    url.protocol === "https:" && !url.username && !url.password
                  );
                } catch {
                  return false;
                }
              }),
          })
          .strict(),
      )
      .max(5),
    mode: z.literal("model"),
    model: z.string().min(1),
  })
  .strict();
export const chatStoresSchema = z.object({
  stores: z
    .array(
      z.object({
        id: identifier,
        name: z.string().min(1),
        description: z.string().nullable(),
        address: z.record(z.string(), z.string()).nullable(),
        latitude: z
          .string()
          .refine(
            (value) =>
              value.trim() !== "" &&
              Number.isFinite(Number(value)) &&
              Math.abs(Number(value)) <= 90,
          ),
        longitude: z
          .string()
          .refine(
            (value) =>
              value.trim() !== "" &&
              Number.isFinite(Number(value)) &&
              Math.abs(Number(value)) <= 180,
          ),
        categories: z.array(z.string()),
        coinRate: storeCoinRateSchema.nullable().default(null),
      }),
    )
    .max(5),
});
export type ChatLocation = z.infer<typeof chatLocationSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatReply = z.infer<typeof chatReplySchema>;
export type ChatStore = z.infer<typeof chatStoresSchema>["stores"][number];
