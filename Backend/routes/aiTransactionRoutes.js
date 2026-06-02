import express from "express";
import { createTransaksiPredict, confirmTransaksiPredict, rejectTransaksiPredict } from "../controllers/aiTransactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createAiPredictionSchema, confirmAiPredictionSchema } from "../validators/aiTransactionValidator.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/predict", validateRequest(createAiPredictionSchema), createTransaksiPredict);
router.post("/confirm", validateRequest(confirmAiPredictionSchema), confirmTransaksiPredict);
router.patch("/reject/:id_transaksi_ai", rejectTransaksiPredict);

router.get("/", (_req, res) => {
  res.json({ ok: true });
});

export default router;