import { z } from "zod"

const jenisTransaksiEnum = z.enum([
    "pemasukan",
    "pengeluaran",
    "tabungan"
])

export const createAiPredictionSchema = z.object({
    raw_text: z.string().min(1, "raw_text wajib diisi"),
    clean_text: z.string().min(1, "clean_text wajib diisi"),
    jenis_transaksi: jenisTransaksiEnum,
    nominal: z.number().positive("nominal harus lebih dari 0"),
    id_kategori: z.string().uuid("id_kategori tidak valid"),
    input_source: z.string().min(1),
    tanggal_transaksi: z.string().refine(v => !Number.isNaN(Date.parse(v))),    
    prediction_source: z.string().min(1),
    jenis_confidence: z.number().min(0).max(1),
    kategori_confidence: z.number().min(0).max(1),
    ai_metadata: z.record(z.any()).optional().default({})
}).strict();

export const confirmAiPredictionSchema = z.object({
    id_transaksi_ai: z.uuid(),
    nama_transaksi: z.string().min(1),
    nominal: z.number().positive(),
    tanggal_transaksi: z.string(),
    jenis_transaksi: jenisTransaksiEnum,
    id_kategori: z.uuid(),
    nama_toko: z.string().nullable().optional(),
    deskripsi: z.string().nullable().optional(),
    id_target: z.uuid().nullable().optional()
}).strict();