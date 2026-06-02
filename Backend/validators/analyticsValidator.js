import { z } from 'zod'
// TODO: Define schema for period query (today|week|month|year).
export const periodQuerySchema = z.object({
    period: z.enum(["today", "week", "month", "year"]),
}).strict();

// TODO: Define schema for category + period query.
export const categoryPeriodQuerySchema = z.object({
    period: z.enum(["today", "week", "month", "year"]),
    id_kategori: z.string().uuid(),
}).strict();
