import { createClient } from "@supabase/supabase-js";

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


export const getAnalyticsSummary = async (accessToken, userId, period, start, end) => {
    const client = userScopeClient(accessToken);

    const { data, error } = await client
        .from("transaksi")
        .select(`
            nominal,
            jenis_transaksi,
            id_kategori,
            kategori:kategori!transaksi_id_kategori_fkey (nama_kategori)
        `)
        .eq("id_pengguna", userId)
        .gte("tanggal_transaksi", start)
        .lte("tanggal_transaksi", end);

    if (error) {
        return {
            data: null,
            error,
        };
    }

    const summary = {
        pemasukan: 0,
        pengeluaran: 0,
        tabungan: 0,
        saldo_bersih: 0,
    };

    const categoryMap = {};

    for (const row of data || []) {

        const nominal = row.nominal || 0;
        const jenis = row.jenis_transaksi;

        if (jenis === "pemasukan") {
            summary.pemasukan += nominal;
        }

        if (jenis === "pengeluaran") {
            summary.pengeluaran += nominal;

            // =========================
            // CATEGORY BREAKDOWN
            // =========================

            const namaKategori =
                row.kategori?.nama_kategori || "Tanpa Kategori";

            if (!categoryMap[namaKategori]) {
                categoryMap[namaKategori] = 0;
            }

            categoryMap[namaKategori] += nominal;
        }

        if (jenis === "tabungan") {
            summary.tabungan += nominal;
        }
    }

    // =========================
    // SALDO BERSIH
    // =========================

    summary.saldo_bersih = summary.pemasukan - summary.pengeluaran - summary.tabungan;

    // =========================
    // DETAIL KATEGORI
    // =========================

    const detailKategori = Object.entries(categoryMap)
        .map(([nama_kategori, total]) => ({
            nama_kategori,
            total,
        }))
        .sort((a, b) => b.total - a.total);

    // =========================
    // KATEGORI TERBESAR
    // =========================

    const kategoriTerbesar =
        detailKategori.length > 0
            ? detailKategori[0]
            : null;

    return {
        data: {
            period,
            summary,
            kategori_terbesar: kategoriTerbesar,
            detail_kategori: detailKategori,
        },
        error: null,
    };
};


