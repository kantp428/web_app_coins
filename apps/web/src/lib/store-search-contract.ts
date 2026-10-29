import { z } from "zod";
import { chatLocationSchema } from "./chat-contract";

const identifier = z
  .string()
  .regex(/^[1-9]\d{0,18}$/)
  .refine(
    (value) =>
      /^[1-9]\d{0,18}$/.test(value) &&
      BigInt(value) <= BigInt("9223372036854775807"),
  );
export const storeSearchRequestSchema = chatLocationSchema
  .extend({
    query: z.string().trim().min(1).max(500),
    page: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER).default(1),
  })
  .strict();
export const storeSearchReplySchema = z
  .object({
    shopIds: z
      .array(identifier)
      .max(50)
      .refine((ids) => new Set(ids).size === ids.length),
    source: z.literal("llm"),
    meta: z
      .object({
        page: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
        pageSize: z.literal(50),
        total: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
        hasNextPage: z.boolean(),
      })
      .strict(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const remaining = Math.max(
      0,
      value.meta.total - (value.meta.page - 1) * 50,
    );
    if (
      value.shopIds.length > Math.min(50, remaining) ||
      value.meta.hasNextPage !== remaining > 50
    ) {
      ctx.addIssue({ code: "custom", message: "Invalid search pagination" });
    }
  });
export type StoreSearchReply = z.infer<typeof storeSearchReplySchema>;
