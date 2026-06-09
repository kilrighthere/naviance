import * as math from "mathjs";

const toNumber = (value) => {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
};

export const buildAggregateFeatures = (transaction) => {
    const featureSum = {
        total_pemasukan: 0,
        total_pengeluaran: 0,
        total_tabungan_investasi: 0,
        jumlah_transaksi: 0,
        total_nominal: 0,
    }

    for (const trx of transaction){
        const nominal = toNumber(trx.nominal);
        featureSum.jumlah_transaksi += 1;
        featureSum.total_nominal += nominal;
        if (trx.jenis_transaksi === "pemasukan") {
            featureSum.total_pemasukan += nominal;
        }
        if (trx.jenis_transaksi === "pengeluaran") {
            featureSum.total_pengeluaran += nominal;
        }
        if (trx.jenis_transaksi === "tabungan") {
            featureSum.total_tabungan_investasi += nominal;
        }
    }

    const values = transaction.map(t => toNumber(t.nominal));
    const median = values.length > 0 ? math.median(values) : 0;
    const rata_rata_nominal = values.length > 0 ? math.mean(values) : 0;
    const max_value = values.length > 0 ? math.max(values) : 0;
    const saldo_akhir_estimasi = featureSum.total_pemasukan - featureSum.total_pengeluaran;

    return {
        ...featureSum,
        rata_rata_nominal: rata_rata_nominal,
        median_nominal: median,
        max_nominal: max_value,
        saldo_akhir_estimasi:saldo_akhir_estimasi
    }
}


