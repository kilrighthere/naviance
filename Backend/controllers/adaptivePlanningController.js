import { getActiveTarget } from "../services/adaptivePlanning/targetService.js";
import { getTransactionData } from "../services/featureEngineering/transactionDataService.js";
import { buildAggregateFeatures } from "../services/featureEngineering/aggregateFeatureService.js";
import { categoryFeature } from "../services/featureEngineering/categoryFeatureService.js";
import { ratioFeature } from "../services/featureEngineering/ratioFeatureService.js";
import { buildGoalFeatures } from "../services/adaptivePlanning/goalFeatureService.js";
import { buildAdaptivePayload } from "../services/adaptivePlanning/adaptivePlanningPayloadService.js";
import { validateAdaptivePlaningPayload } from "../validators/forecastValidator.js";
import { adaptivePlanningService } from "../services/adaptivePlanning/adaptivePlanningApiService.js";

export const getAdaptivePlanning = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const transaction = await getTransactionData(accessToken, userId);
        if (transaction.error) {
            return res.status(400).json({
                status: "failed",
                message: "Gagal mengambil data transaksi. Silakan coba lagi."
            });
        }

        if (!transaction.data || transaction.data.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "Belum ada data transaksi dalam 30 hari terakhir. Tambahkan transaksi terlebih dahulu untuk mendapatkan rencana keuangan adaptif."
            });
        }

        const hasIncome = transaction.data.some(t => t.jenis_transaksi === "pemasukan");
        if (!hasIncome) {
            return res.status(400).json({
                status: "failed",
                message: "Belum ada transaksi pemasukan yang tercatat dalam 30 hari terakhir. Tambahkan pemasukan agar analisis keuangan dapat dihitung dengan akurat."
            });
        }

        const activeTarget = await getActiveTarget(accessToken, userId);
        if (activeTarget.error) {
            return res.status(400).json({
                status: "failed",
                message: "Belum ada target tabungan yang aktif. Silakan buat target tabungan terlebih dahulu."
            });
        }

        const aggregate = buildAggregateFeatures(transaction.data);
        const category = categoryFeature(transaction.data);
        const ratio = ratioFeature(transaction.data);
        const goal = buildGoalFeatures(activeTarget.data, transaction.data);
        console.log(JSON.stringify(goal, null, 2));
        const payload = buildAdaptivePayload({
            goalFeatures: goal,
            aggregateFeatures: aggregate,
            ratioFeatures: ratio,
            categoryFeatures: category
        });

        console.log(JSON.stringify(payload, null, 2));
        const validation = validateAdaptivePlaningPayload(payload);

        if (validation.error) {
            return res.status(validation.error.statusCode).json({
                status: "failed",
                message: validation.error.message
            });
        }
        const planning = await adaptivePlanningService(payload);
        if (planning.error) {
            return res.status(500).json({
                status: "failed",
                message: planning.error
            });
        }

        return res.status(200).json({
            status: "success",
            data: planning.data
        })
    } catch (error) {
        next(error);
    }
}