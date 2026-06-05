import express from "express";
import cors from "cors";
import transactionRoutes from "./routes/transactionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import aiTransactionRoutes from "./routes/aiTransactionRoutes.js";
import patternPredictRoutes from "./routes/patternPredictRoutes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0";

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
    return res.status(200).json({ status: "ok" });
});

app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/chatbot", aiTransactionRoutes);
app.use("/api/v1/pattern", patternPredictRoutes);

app.use((err, _req, res, _next) => {
    console.error(err);
    return res.status(500).json({ status: "failed", message: "Internal Server Error" });
});

app.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`);
});