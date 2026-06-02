import {
    createTransaksi as createTransaksiService,
    updateTransaksi as updateTransaksiService,
    deleteTransaksi as deleteTransaksiService,
    getCategoryTotalByPeriod as getCategoryTotalByPeriodService,
    getSummaryByPeriod as getSummaryByPeriodService,
} from "../services/transactionService.js";
import { getPeriodRange } from "../utils/periodRange.js";

export const createTransaksi = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const { data, error } = await createTransaksiService(accessToken, userId, req.body);

        if (error) {
            const statusCode = /tidak ditemukan/i.test(error.message) ? 404 : 400;
            return res.status(statusCode).json({ status: "failed", message: error.message });
        }

        return res.status(201).json({ status: "success", data });
    } catch (error) {
        return next(error);
    }
};

export const updateTransaksi = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const { id_transaksi: idTransaksi } = req.params;
        const { data, error } = await updateTransaksiService(accessToken, userId, idTransaksi, req.body);

        if (!data) {
            return res.status(404).json({
                status: "failed",
                message: "Transaksi tidak ditemukan"
            });   
        }
        if (error) {
            const statusCode = /tidak ditemukan/i.test(error.message) ? 404 : 400;
            return res.status(statusCode).json({ status: "failed", message: error.message });
        }

        return res.status(200).json({ status: "success", data });
    } catch (error) {
        return next(error);
    }
};

export const deleteTransaksi = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const { id_transaksi: idTransaksi } = req.params;
        const { data, error } = await deleteTransaksiService(accessToken, userId, idTransaksi);

        if (!data) {
            return res.status(404).json({
                status: "failed",
                message: "Transaksi tidak ditemukan"
            });   
        }

        if (error) {
            const statusCode = /tidak ditemukan/i.test(error.message) ? 404 : 400;
            return res.status(statusCode).json({ status: "failed", message: error.message });
        }

        return res.status(200).json({ status: "success", data });
    } catch (error) {
        return next(error);
    }
};

export const getSummaryByPeriod = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const { period } = req.query;
        if (!period) {
            return res.status(400).json({ status: "failed", message: "Parameter period wajib diisi" });
        }
        const { start, end } = getPeriodRange(period);
        const { data, error } = await getSummaryByPeriodService(accessToken, userId, start, end);

        console.log({
            userId,
            start,
            end
        });

        console.log(data);
        console.log(error);

        if (error) {
            const statusCode = /tidak ditemukan/i.test(error.message) ? 404 : 400;
            return res.status(statusCode).json({ status: "failed", message: error.message });
        }

        return res.status(200).json({ 
            status: "success", 
            data: {
                period: period,
                summary: data,
                
            }
        });
    } catch (error) {
        return next(error);
    }
};

export const getCategoryTotalByPeriod = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const accessToken = req.accessToken;
        const { period, id_kategori: idKategori } = req.query;
        if (!period) {
            return res.status(400).json({ status: "failed", message: "Parameter period wajib diisi" });
        }
        if (!idKategori) {
            return res.status(400).json({ status: "failed", message: "Parameter id_kategori wajib diisi" });
        }
        const { start, end } = getPeriodRange(period);
        const { data, error } = await getCategoryTotalByPeriodService(
            accessToken,
            userId,
            idKategori,
            start,
            end
        );

        if (!data) {
            return res.status(404).json({
                status: "failed",
                message: "Transaksi tidak ditemukan"
            });   
        }


        if (error) {
            const statusCode = /tidak ditemukan/i.test(error.message) ? 404 : 400;
            return res.status(statusCode).json({ status: "failed", message: error.message });
        }

        return res.status(200).json({ 
            status: "success", data });
    } catch (error) {
        return next(error);
    }
};
