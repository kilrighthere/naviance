import * as math from "mathjs";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// const calculateAvg2TotalTabungan = (transactions) => {

//     const monthlySaving = {};

//     for (const trx of transactions) {


//         if (trx.jenis_transaksi !== "tabungan") {
//             continue;
//         }

//         const trxDate = new Date(trx.tanggal_transaksi);

//         const monthKey = `${trxDate.getFullYear()}-${String(trxDate.getMonth() + 1).padStart(2, "0")}`;

//         monthlySaving[monthKey] = (monthlySaving[monthKey] || 0) + trx.nominal;
//     }

//     const sortedMonths =
//         Object.keys(monthlySaving).sort();

//     const lastTwoMonths =
//         sortedMonths.slice(-2);

//     if (lastTwoMonths.length === 0) {
//         return 0;
//     }

//     const total = lastTwoMonths.reduce(
//         (sum, month) => sum + monthlySaving[month],
//         0
//     );

//     return total / lastTwoMonths.length;
// };

// export const buildGoalFeatures = (target, transaction) => {
//     /* {
//     target_tabungan,
//     deadline_bulan,
//     bulan_ke,

//     jml_tabungan,
//     avg2_total_tabungan,

//     kebutuhan_tabungan_per_bulan,
//     sisa_target_tabungan,
//     sisa_deadline_bulan
// } */
//     const target_tabungan = target.nominal_target;
    
//     const now = new Date();

//     const createdAt = new Date(target.created_at);
//     const deadline = new Date(target.deadline);

//     // const deadline_bulan = (deadline.getFullYear()-createdAt.getFullYear())*12 + (deadline.getMonth() - createdAt.getMonth());

//     // const bulan_ke = ((now.getFullYear() - createdAt.getFullYear()) * 12) + (now.getMonth() - createdAt.getMonth()) + 1;

//     // const sisa_deadline_bulan = ((deadline.getFullYear() - now.getFullYear()) * 12) + (deadline.getMonth() - now.getMonth());
    

//     const totalDays = math.ceil((deadline - createdAt) / MS_PER_DAY);

//     const remainingDays = math.ceil((deadline - now) / MS_PER_DAY);

//     const deadline_bulan = math.max(1,math.ceil(totalDays / 30));

//     const sisa_deadline_bulan = math.max(0, math.ceil(remainingDays / 30));

//     const bulan_ke = math.max(1, deadline_bulan - sisa_deadline_bulan + 1);

//     const jml_tabungan = transaction.reduce((sum, trx) => {
//         const jenis_transaksi = trx.jenis_transaksi.toLowerCase();

//         if (jenis_transaksi === "tabungan") {
//             sum += trx.nominal;
//         }
//         return sum;
//     }, 0)

//     const sisa_target_tabungan = math.max(target.nominal_target - jml_tabungan, 0);

//     const kebutuhan_tabungan_per_bulan = sisa_deadline_bulan > 0? sisa_target_tabungan / sisa_deadline_bulan:0;

//     const avg2_total_tabungan = calculateAvg2TotalTabungan(transaction);
//     return {
//         target_tabungan,
//         deadline_bulan,
//         bulan_ke,

//         jml_tabungan,
//         avg2_total_tabungan,

//         kebutuhan_tabungan_per_bulan,
//         sisa_target_tabungan,
//         sisa_deadline_bulan
//     };    
// }

const calculateAvg2TotalTabungan = (transactions) => {
    const now = new Date();
    const monthlySaving = {};

    for (const trx of transactions) {
        if (trx.jenis_transaksi.toLowerCase() !== "tabungan") continue;
        const trxDate = new Date(trx.tanggal_transaksi);
        const key = `${trxDate.getFullYear()}-${String(trxDate.getMonth()+1).padStart(2,"0")}`;
        monthlySaving[key] = (monthlySaving[key] || 0) + trx.nominal;
    }

    // ✅ Selalu evaluasi tepat 2 bulan: bulan ini dan bulan lalu
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth()+1).padStart(2,"0")}`;

    const totalDua = (monthlySaving[thisMonth] || 0) + (monthlySaving[lastMonth] || 0);
    return totalDua / 2; // selalu dibagi 2
};


export const buildGoalFeatures = (target, transaction) => {
    const target_tabungan = target.nominal_target;

    const now = new Date();
    const createdAt = new Date(target.created_at);
    
    const deadline = new Date(target.deadline + "T12:00:00");

    const totalDays    = math.ceil((deadline - createdAt) / MS_PER_DAY);
    const remainingDays = math.ceil((deadline - now) / MS_PER_DAY);
    const elapsedDays  = math.ceil((now - createdAt) / MS_PER_DAY);

    const deadline_bulan     = math.max(1, math.ceil(totalDays / 30));
    const sisa_deadline_bulan = math.max(0, math.ceil(remainingDays / 30));
    const bulan_ke            = math.max(1, math.ceil(elapsedDays / 30));

    const jml_tabungan = transaction.reduce((sum, trx) => {
        if (trx.jenis_transaksi.toLowerCase() === "tabungan") {
            sum += trx.nominal;
        }
        return sum;
    }, 0);

    const sisa_target_tabungan = math.max(target.nominal_target - jml_tabungan, 0);

    const kebutuhan_tabungan_per_bulan = sisa_deadline_bulan > 0
        ? sisa_target_tabungan / sisa_deadline_bulan
        : 0;

    const avg2_total_tabungan = calculateAvg2TotalTabungan(transaction);

    return {
        target_tabungan,
        deadline_bulan,
        bulan_ke,
        jml_tabungan,
        avg2_total_tabungan,
        kebutuhan_tabungan_per_bulan,
        sisa_target_tabungan,
        sisa_deadline_bulan
    };
};