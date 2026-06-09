export const validateAdaptivePlaningPayload = (payload) => {

    if (!payload) {
        return {
            error: {
                statusCode: 400,
                message: "Data tidak lengkap untuk membuat rencana keuangan adaptif."
            }
        };
    }

    // Business rule: target dan deadline harus valid sebelum validasi field lain
    if (!payload.target_tabungan || payload.target_tabungan <= 0) {
        return {
            error: {
                statusCode: 400,
                message: "Target tabungan harus lebih besar dari 0. Silakan periksa kembali target yang telah dibuat."
            }
        };
    }

    if (!payload.deadline_bulan || payload.deadline_bulan <= 0) {
        return {
            error: {
                statusCode: 400,
                message: "Deadline target tidak valid. Pastikan tanggal deadline belum terlewati."
            }
        };
    }

    if (payload.sisa_deadline_bulan <= 0) {
        return {
            error: {
                statusCode: 400,
                message: "Target tabungan sudah melewati batas waktu (deadline). Silakan perbarui target dengan deadline yang baru."
            }
        };
    }

    // Business rule: pemasukan harus ada agar rasio dapat dihitung
    if (!payload.total_pemasukan || payload.total_pemasukan <= 0) {
        return {
            error: {
                statusCode: 400,
                message: "Belum ada transaksi pemasukan yang tercatat. Tambahkan pemasukan agar rencana keuangan dapat dianalisis."
            }
        };
    }

    const requiredFields = [
        "target_tabungan",
        "deadline_bulan",
        "bulan_ke",

        "total_pemasukan",
        "total_pengeluaran",
        "total_tabungan_investasi",
        "saldo_akhir_estimasi",

        "jml_tabungan",
        "avg2_total_tabungan",
        "kebutuhan_tabungan_per_bulan",
        "sisa_target_tabungan",
        "sisa_deadline_bulan",

        "rasio_pengeluaran",
        "rasio_tabungan_investasi",
        "rasio_hiburan",
        "rasio_belanja_fashion",
        "rasio_kebutuhan_pokok",

        "Makanan & Minuman",
        "Fashion",
        "Hiburan",
        "Belanja",
        "Tagihan",
        "Transportasi",
        "Kesehatan",
        "Pendidikan",
        "Lainnya"
    ];

    for (const field of requiredFields) {

        const value = payload[field];

        if (value === undefined || value === null) {
            return {
                error: {
                    statusCode: 400,
                    message: `Data keuangan tidak lengkap (${field}). Pastikan semua data transaksi sudah tercatat dengan benar.`
                }
            };
        }

        if (typeof value !== "number") {
            return {
                error: {
                    statusCode: 400,
                    message: `Data keuangan tidak valid (${field}). Pastikan semua nilai transaksi berupa angka.`
                }
            };
        }

        if (Number.isNaN(value)) {
            return {
                error: {
                    statusCode: 400,
                    message: "Terjadi kesalahan saat menghitung data keuangan. Pastikan data transaksi pemasukan dan pengeluaran sudah lengkap."
                }
            };
        }

        if (!Number.isFinite(value)) {
            return {
                error: {
                    statusCode: 400,
                    message: "Terjadi kesalahan perhitungan keuangan. Pastikan terdapat transaksi pemasukan agar rasio dapat dihitung."
                }
            };
        }
    }

    return {
        error: null
    };
};