import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getAdaptivePlanning } from "../controllers/adaptivePlanningController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { validateAdaptivePlaningPayload } from "../validators/forecastValidator.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/predict", getAdaptivePlanning);
export default router;