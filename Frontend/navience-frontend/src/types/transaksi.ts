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

export const CATEGORIES = [
  { id_kategori: "af5dc46e-26bf-48b1-8ba8-2124d0928a49", nama_kategori: "makanan dan minuman" },
  { id_kategori: "146489bd-fb7d-4e5c-bbec-932c9245697a", nama_kategori: "fashion" },
  { id_kategori: "3cbd5118-8524-4dd8-b1a0-f2c83a16d245", nama_kategori: "kesehatan" },
  { id_kategori: "38f317d7-034f-4900-912b-7328042381de", nama_kategori: "transportasi" },
  { id_kategori: "3eab81f1-8a6b-4bb7-b195-0e644ca41ca0", nama_kategori: "pendidikan" },
  { id_kategori: "96f5a9c1-da72-43d7-bbdf-d5888e10c6aa", nama_kategori: "belanja" },
  { id_kategori: "cc700e23-4002-4bf1-bfe2-d9447af4e6b4", nama_kategori: "bonus" },
  { id_kategori: "8c36ed44-1a2b-4b47-a50e-7e525660ed5d", nama_kategori: "gaji" },
  { id_kategori: "80a90f45-811b-48d3-8f9c-0137873aff53", nama_kategori: "hiburan" },
  { id_kategori: "c3bf77bf-aed9-4c01-a554-407ec8237bcb", nama_kategori: "investasi" },
  { id_kategori: "83a23757-6790-487c-9868-c8e39453ad28", nama_kategori: "tabungan" },
  { id_kategori: "c0751a34-b2d0-4094-a5be-83b5068be5bb", nama_kategori: "tagihan" },
  { id_kategori: "563483bf-ae5b-41d2-82dd-7289c18aba7b", nama_kategori: "lainnya" }
];