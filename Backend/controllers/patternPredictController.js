import { getTransactionData } from "../services/featureEngineering/transactionDataService.js";
import { buildAggregateFeatures } from "../services/featureEngineering/aggregateFeatureService.js";
import { categoryFeature } from "../services/featureEngineering/categoryFeatureService.js";
import { ratioFeature } from "../services/featureEngineering/ratioFeatureService.js";
import { FEATURE_ORDER } from "../services/featureEngineering/featureSchema.js";
import { buildFeatureVector } from "../services/featureEngineering/buildVectorOrder.js";
import { predictSpendingPattern } from "../services/mlService.js";

export const predictPattern = async (req,res,next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const trxResult =
            await getTransactionData(
                accessToken,
                userId
            );

        if (trxResult.error) {
            return res.status(400).json({
                status: "failed",
                message: "Gagal mengambil data transaksi. Silakan coba lagi."
            });
        }

        if (!trxResult.data || trxResult.data.length === 0) {
            return res.status(400).json({
                status: "no_data",
                message: "Belum ada data transaksi dalam 30 hari terakhir. Tambahkan transaksi untuk melihat kondisi kesehatan keuangan Anda."
            });
        }

        const aggregate =
            buildAggregateFeatures(
                trxResult.data
            );

        const category =
            categoryFeature(
                trxResult.data
            );

        const ratio =
            ratioFeature(
                trxResult.data
            );

        const featureObject = {
            ...aggregate,
            ...category,
            ...ratio
        };

        const featureVector =
            buildFeatureVector(
                featureObject
            );

        const prediction =
            await predictSpendingPattern(
                featureVector
            );

        if (prediction.error) {
            return res.status(500).json({
                status: "failed",
                message: prediction.error
            });
        }

        return res.status(200).json({
            status: "success",
            data: {
                classification: prediction.data.label,
                confidence: prediction.data.confidence,
                probabilities: prediction.data.probabilities
            }
        });
    } catch (error) {
        next(error);
    }
};