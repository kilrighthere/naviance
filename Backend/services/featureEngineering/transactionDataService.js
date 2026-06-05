import { createClient } from "@supabase/supabase-js";
import { formatLocalDate } from "../../utils/periodRange.js";
export const userScopeClient = (token) => {
    return createClient(
        process.env.SUPABASE_URL, 
        process.env.SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    )
}

export const getTransactionData = async (accessToken, userId) => {
    const client = userScopeClient(accessToken);

    // 1. Ambil objek Date hari ini terlebih dahulu
    const today = new Date();
    // 2. Format tanggal end (hari ini)
    const end = formatLocalDate(today);
    // 3. Buat objek Date baru untuk start dengan mengurangi 30 hari dari objek 'today'
    const startDateObj = new Date(today);
    startDateObj.setDate(today.getDate() - 30);
    // 4. Format tanggal start (Gunakan 'const' baru agar tidak error)
    const start = formatLocalDate(startDateObj);

    const { data, error } = await client
        .from('transaksi')
        .select(`nominal, tanggal_transaksi, jenis_transaksi, kategori(nama_kategori)`)
        .eq('id_pengguna', userId)
        .gte('tanggal_transaksi',start)
        .lte('tanggal_transaksi', end);

    if (error) {
        return { data: null, error}
    }

    return { data, error: null}
}