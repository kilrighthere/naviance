import express from "express";

import { predictPattern } from "../controllers/patternPredictController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
    "/predict",
    predictPattern
);

export default router;