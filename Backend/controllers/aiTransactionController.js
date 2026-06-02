import { 
    createTransaksiPredict as createPredictService,
    confirmTransaksiPredict as confirmPredictService,
    rejectTransactionPredict as rejectPredictService 

} from "../services/aiTransactionService.js";

export const createTransaksiPredict = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const { data, error } = await createPredictService(accessToken, userId, req.body);
        if (error) {
            const statusCode = /tidak ditemukan/i.test(error.message) ? 404 : 400;
            return res.status(statusCode).json({ status: "failed", message: error.message });
        }

        return res.status(201).json({ status: "success", data });
    } catch (error) {
        return next(error);
    }
};

export const confirmTransaksiPredict = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const { data, error } = await confirmPredictService(accessToken, userId, req.body);

        if (error) {
            const statusCode = /tidak ditemukan/i.test(error.message) ? 404 : 400;
            return res.status(statusCode).json({ status: "failed", message: error.message });
        }

        return res.status(200).json({ status: "success", data });
    } catch (error) {
        return next(error);
    }
}

export const rejectTransaksiPredict = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const { id_transaksi_ai } = req.params;
        const { data, error } = await rejectPredictService( accessToken, userId, id_transaksi_ai);

        if (error) {
            const statusCode = /tidak ditemukan/i.test(error.message) ? 404 : 400;

            return res.status(statusCode).json({
                status: "failed",
                message: error.message
            });
        }

        return res.status(200).json({
            status: "success",
            data
        });
    } catch (error) {
        return next(error);
    }
};
