import express from "express";
import {
    createTransaksi,
    updateTransaksi,
    deleteTransaksi,
    getCategoryTotalByPeriod,
    getSummaryByPeriod,
} from "../controllers/transactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createTransaksiSchema,
    updateTransactionScheme,
    periodQuerySchema,
    categoryPeriodQuerySchema,
} from "../validators/transactionValidator.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", validateRequest(createTransaksiSchema), createTransaksi);
router.patch("/:id_transaksi", validateRequest(updateTransactionScheme), updateTransaksi);
router.delete("/:id_transaksi", deleteTransaksi);
router.get("/summary", validateRequest(periodQuerySchema, "query"), getSummaryByPeriod);
router.get(
    "/summary/category",
    validateRequest(categoryPeriodQuerySchema, "query"),
    getCategoryTotalByPeriod
);

export default router;
