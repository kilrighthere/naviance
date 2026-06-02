import { z } from "zod";
// TODO: Define schema for create transaction payload.
export const createTransaksiSchema = 
    z.object({
        id_kategori: z.string().uuid(),
        id_target: z.string().uuid().nullable().optional(),
        jenis_transaksi: z.enum(["pemasukan", "pengeluaran", "tabungan"]),
        nama_toko: z.string().max(100).nullable().optional(),
        nama_transaksi: z.string().max(100).nullable().optional(),
        nominal: z.coerce.number().min(1),
        tanggal_transaksi: z.string().refine(v => !Number.isNaN(Date.parse(v))),
        deskripsi: z.string().max(500).nullable().optional(),
    }).strict();
    
// TODO: Define schema for update transaction payload (optional fields).
export const updateTransactionScheme = z.object({
        id_kategori: z.string().uuid().optional(),
        id_target: z.string().uuid().nullable().optional(),
        jenis_transaksi: z.enum(["pemasukan", "pengeluaran", "tabungan"]).optional(),
        nama_toko: z.string().max(100).nullable().optional(),
        nama_transaksi: z.string().max(100).nullable().optional(),
        nominal: z.coerce.number().min(1).optional(),
        tanggal_transaksi: z.string().refine(v => !Number.isNaN(Date.parse(v))).optional(),
        deskripsi: z.string().max(500).nullable().optional(),
})
    .strict()
    .refine(value => Object.keys(value).length > 0, {
        message: "At least one field is required for update",
    });

// TODO: Define schema for period query (today|week|month|year).
export const periodQuerySchema = z.object({
    period: z.enum(["today", "week", "month", "year"]),
}).strict();

// TODO: Define schema for category + period query.
export const categoryPeriodQuerySchema = z.object({
    period: z.enum(["today", "week", "month", "year"]),
    id_kategori: z.string().uuid(),
}).strict();
