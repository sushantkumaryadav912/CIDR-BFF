import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { correlationMiddleware } from "./middleware/correlation.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import testRoutes from "./routes/test.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(correlationMiddleware);

// Health Check
app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok" });
});

// Test Route
app.use("/api", testRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;