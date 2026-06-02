import { getAnalyticsSummary as getAnalyticsService } from "../services/analyticsService.js";
import { getPeriodRange } from "../utils/periodRange.js";

export const getSummaryAnalytics = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const { period } = req.query;
        if (!period) {
            return res.status(400).json({ status: "failed", message: "Parameter period wajib diisi" });
        }
        const { start, end } = getPeriodRange(period)
        const { data, error } = await getAnalyticsService(accessToken, userId, period, start, end);

        if (!data) {
            return res.status(404).json({status: 'failed', message:'data tidak ditemukan'})
        }
        if (error) {
            return res.status(400).json({status: failed, message: error.message});
        }
        return res.status(200).json({
            status: 'success',
            data
        })
    } catch (error) {
        return next(error);
    }
}