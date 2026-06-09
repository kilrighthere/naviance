// export const categoryFeature  = (transaction) => {
//     const value = transaction.reduce((acc, item) => {
//         const kat = item.kategori?.nama_kategori;;
//         const countKey = `count_${kat}`;

//         if (!acc[kat]) {
//             acc[kat] = 0;
//             acc[countKey] = 0;

//         }

//         acc[kat] += item.nominal;
//         acc[countKey] +=1;

//         return acc;
//     }, {})
//     return value;
// }


const CATEGORY_NAMES = [
    "belanja",
    "bonus",
    "fashion",
    "gaji",
    "hiburan",
    "investasi",
    "kesehatan",
    "lainnya",
    "makanan dan minuman",
    "pendidikan",
    "tabungan",
    "tagihan",
    "transportasi"
];

const toNumber = (value) => {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
};

const CATEGORY_MAP = {
    "belanja": "Belanja",
    "bonus": "Bonus",
    "fashion": "Fashion",
    "gaji": "Gaji",
    "hiburan": "Hiburan",
    "investasi": "Investasi",
    "kesehatan": "Kesehatan",
    "lainnya": "Lainnya",
    "makanan dan minuman": "Makanan & Minuman",
    "pendidikan": "Pendidikan",
    "tabungan": "Tabungan",
    "tagihan": "Tagihan",
    "transportasi": "Transportasi"
};

export const categoryFeature = (transactions) => {
    const result = {};

    for (const category of CATEGORY_NAMES) {
        result[`count_${category}`] = 0;
        result[category] = 0;
    }


    for (const trx of transactions) {
        const category = trx.kategori?.nama_kategori;

        if (!category) continue;

        result[category] += toNumber(trx.nominal);
        result[`count_${category}`] += 1;
    }

//     for (const trx of transactions) {
//     const category =
//         trx.kategori?.nama_kategori?.toLowerCase();

//     if (!category) continue;

//     result[category] += trx.nominal || 0;

//     const formatted =
//         CATEGORY_MAP[category];

//     result[`count_${formatted}`] += 1;
// }

    return result;
};