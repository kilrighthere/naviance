export const buildAdaptivePayload = ({goalFeatures, aggregateFeatures, ratioFeatures, categoryFeatures}) => {
    return {
        target_tabungan: goalFeatures.target_tabungan,

        deadline_bulan: goalFeatures.deadline_bulan,

        bulan_ke: goalFeatures.bulan_ke,

        jml_tabungan: goalFeatures.jml_tabungan,

        avg2_total_tabungan: goalFeatures.avg2_total_tabungan,

        kebutuhan_tabungan_per_bulan: goalFeatures.kebutuhan_tabungan_per_bulan,

        sisa_target_tabungan: goalFeatures.sisa_target_tabungan,

        sisa_deadline_bulan: goalFeatures.sisa_deadline_bulan,

        total_pemasukan: aggregateFeatures.total_pemasukan,

        total_pengeluaran: aggregateFeatures.total_pengeluaran,

        total_tabungan_investasi: aggregateFeatures.total_tabungan_investasi,

        saldo_akhir_estimasi: aggregateFeatures.saldo_akhir_estimasi,

        rasio_pengeluaran: ratioFeatures.rasio_pengeluaran,

        rasio_tabungan_investasi: ratioFeatures.rasio_tabungan_investasi,

        rasio_hiburan: ratioFeatures.rasio_hiburan,

        rasio_belanja_fashion: ratioFeatures.rasio_belanja_fashion,

        rasio_kebutuhan_pokok: ratioFeatures.rasio_kebutuhan_pokok,

        "Makanan & Minuman": categoryFeatures["makanan dan minuman"],

        "Fashion": categoryFeatures["fashion"],

        "Hiburan": categoryFeatures["hiburan"],

        "Belanja": categoryFeatures["belanja"],

        "Tagihan": categoryFeatures["tagihan"],

        "Transportasi": categoryFeatures["transportasi"],

        "Kesehatan": categoryFeatures["kesehatan"],

        "Pendidikan": categoryFeatures["pendidikan"],

        "Lainnya": categoryFeatures["lainnya"]
    };
};