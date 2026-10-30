import { z } from "zod";

export const storeCoinRateSchema = z
  .object({
    coins: z.number().int().min(1).max(10),
    minimumPurchase: z.string().regex(/^\d+\.\d{2}$/),
    endsAt: z.string().datetime({ offset: true }),
  })
  .strict();

export type StoreCoinRate = z.infer<typeof storeCoinRateSchema>;
