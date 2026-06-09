import { buildAggregateFeatures } from "./aggregateFeatureService.js";
import { categoryFeature } from "./categoryFeatureService.js";

const toNumber = (value) => {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
};

export const ratioFeature = (transaction) => {
    const aggregateFeature = buildAggregateFeatures(transaction);
    const categoryFeatureValue = categoryFeature(transaction);

    const total_pengeluaran = aggregateFeature.total_pengeluaran;
    const total_tabungan = aggregateFeature.total_tabungan_investasi;
    const total_pemasukan = aggregateFeature.total_pemasukan;
    const sumMakanMinum = categoryFeatureValue["makanan dan minuman"];
    const sumBelanjaFashion = categoryFeatureValue["belanja"] + categoryFeatureValue["fashion"];
    const hiburan = categoryFeatureValue["hiburan"];
    const kebutuhan_pokok = sumMakanMinum + categoryFeatureValue["tagihan"] + categoryFeatureValue["transportasi"];

    const rasioPengeluaran = total_pemasukan > 0 ? total_pengeluaran / total_pemasukan : 0;
    const rasioTabunganInvestasi = total_pemasukan > 0 ? total_tabungan / total_pemasukan : 0;
    const rasioMakanan = total_pengeluaran > 0 ? sumMakanMinum / total_pengeluaran : 0;
    const rasioBelanjaFashion = total_pengeluaran > 0 ? sumBelanjaFashion / total_pengeluaran : 0;
    const rasioHiburan = total_pengeluaran > 0 ? hiburan / total_pengeluaran : 0;
    const rasioKebutuhanPokok = total_pengeluaran > 0 ? kebutuhan_pokok / total_pengeluaran : 0;

    const sumTransaksi = {
        jumlah_transaksi_akhir_bulan: 0,
        jumlah_transaksi_awal_bulan:0,
        total_pengeluaran_awal_bulan:0,
        total_pengeluaran_akhir_bulan:0
    }

    for ( const trx of transaction) {
        const nominal = toNumber(trx.nominal);
        const day = new Date(trx.tanggal_transaksi).getDate();
        if (day<= 10 && day>1) {
            sumTransaksi.jumlah_transaksi_awal_bulan+=1;
            if (trx.jenis_transaksi === "pengeluaran"){
                sumTransaksi.total_pengeluaran_awal_bulan += nominal;
            }
        }
        if (day<= 31 && day>=21) {
            sumTransaksi.jumlah_transaksi_akhir_bulan+=1;
            if (trx.jenis_transaksi === "pengeluaran"){
                sumTransaksi.total_pengeluaran_akhir_bulan += nominal;
            }
        }
    }

    const rasioPengeluaranAkhirBulan = total_pengeluaran > 0 ? sumTransaksi.total_pengeluaran_akhir_bulan / total_pengeluaran : 0;
    const rasioPengeluranAwalBulan = total_pengeluaran > 0 ? sumTransaksi.total_pengeluaran_awal_bulan / total_pengeluaran : 0;
    const rasio_transaksi_akhir_bulan = aggregateFeature.jumlah_transaksi > 0 ? sumTransaksi.jumlah_transaksi_akhir_bulan / aggregateFeature.jumlah_transaksi : 0;

    return {
        rasio_pengeluaran: rasioPengeluaran,
        rasio_tabungan_investasi: rasioTabunganInvestasi,
        rasio_makanan: rasioMakanan,
        rasio_belanja_fashion: rasioBelanjaFashion,
        rasio_hiburan: rasioHiburan,
        rasio_kebutuhan_pokok: rasioKebutuhanPokok,
        rasio_pengeluaran_akhir_bulan: rasioPengeluaranAkhirBulan,
        rasio_transaksi_akhir_bulan: rasio_transaksi_akhir_bulan,
        ...sumTransaksi
    }
}