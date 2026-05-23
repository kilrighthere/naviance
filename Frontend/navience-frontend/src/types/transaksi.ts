export type JenisTransaksi = "pemasukan" | "pengeluaran" | "tabungan"; // sesuaikan enum Supabase

export interface Transaksi {
  id_transaksi: string;
  id_pengguna: string;
  id_target: string | null;
  nama_transaksi: string | null;
  tanggal_transaksi: string; // ISO date (YYYY-MM-DD)
  nominal: number;
  jenis_transaksi: JenisTransaksi;
  nama_toko: string | null;
  deskripsi: string | null;
  created_at: string; // ISO timestamp
  id_kategori: string;
}