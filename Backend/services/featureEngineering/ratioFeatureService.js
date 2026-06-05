import { buildAggregateFeatures } from "./aggregateFeatureService.js";
import { categoryFeature } from "./categoryFeatureService.js";

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

    const rasioPengeluaran = total_pengeluaran/total_pemasukan;
    const rasioTabunganInvestasi = total_tabungan/total_pemasukan;
    const rasioMakanan = sumMakanMinum/total_pengeluaran;
    const rasioBelanjaFashion = sumBelanjaFashion/total_pengeluaran;
    const rasioHiburan = hiburan/total_pengeluaran;
    const rasioKebutuhanPokok = kebutuhan_pokok/total_pengeluaran;

    const sumTransaksi = {
        jumlah_transaksi_akhir_bulan: 0,
        jumlah_transaksi_awal_bulan:0,
        total_pengeluaran_awal_bulan:0,
        total_pengeluaran_akhir_bulan:0
    }

    for ( const trx of transaction) {
        const day = new Date(trx.tanggal_transaksi).getDate();
        if (day<= 10 && day>1) {
            sumTransaksi.jumlah_transaksi_awal_bulan+=1;
            if (trx.jenis_transaksi === "pengeluaran"){
                sumTransaksi.total_pengeluaran_awal_bulan+= trx.nominal
            }
        }
        if (day<= 31 && day>=21) {
            sumTransaksi.jumlah_transaksi_akhir_bulan+=1;
            if (trx.jenis_transaksi === "pengeluaran"){
                sumTransaksi.total_pengeluaran_akhir_bulan+= trx.nominal
            }
        }
    }

    const rasioPengeluaranAkhirBulan = sumTransaksi.total_pengeluaran_akhir_bulan/total_pengeluaran;
    const rasioPengeluranAwalBulan = sumTransaksi. total_pengeluaran_awal_bulan/total_pengeluaran;
    const rasio_transaksi_akhir_bulan = sumTransaksi.jumlah_transaksi_akhir_bulan / aggregateFeature.jumlah_transaksi;

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