export const validateAdaptivePlaningPayload = (payload) => {

    if (!payload) {
        return {
            error: {
                statusCode: 400,
                message: "Payload AdaptivePlaninging tidak ditemukan"
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
                    message: `Feature '${field}' bernilai null atau undefined`
                }
            };
        }

        if (typeof value !== "number") {
            return {
                error: {
                    statusCode: 400,
                    message: `Feature '${field}' harus berupa number`
                }
            };
        }

        if (Number.isNaN(value)) {
            return {
                error: {
                    statusCode: 400,
                    message: `Feature '${field}' bernilai NaN`
                }
            };
        }

        if (!Number.isFinite(value)) {
            return {
                error: {
                    statusCode: 400,
                    message: `Feature '${field}' tidak valid (Infinity)`
                }
            };
        }
    }

    if (payload.target_tabungan <= 0) {
        return {
            error: {
                statusCode: 400,
                message: "Target tabungan harus lebih besar dari 0"
            }
        };
    }

    if (payload.deadline_bulan <= 0) {
        return {
            error: {
                statusCode: 400,
                message: "Deadline bulan harus lebih besar dari 0"
            }
        };
    }

    if (payload.sisa_deadline_bulan <= 0) {
        return {
            error: {
                statusCode: 400,
                message: "Target telah melewati deadline"
            }
        };
    }

    return {
        error: null
    };
};