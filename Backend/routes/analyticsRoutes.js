import express from "express";

import { getSummaryAnalytics } from "../controllers/analyticsController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { periodQuerySchema, categoryPeriodQuerySchema } from "../validators/analyticsValidator.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/summary", validateRequest(periodQuerySchema, "query"),getSummaryAnalytics);

export default router;