import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { correlationMiddleware } from "./middleware/correlation.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { publicRateLimiter } from "./middleware/rate-limit.middleware";
import { logger, morganFormat } from "./utils/logger";

// Import routes
import authRoutes from "./routes/auth.routes";
import alertRoutes from "./routes/alerts.routes";
import logRoutes from "./routes/logs.routes";
import workflowRoutes from "./routes/workflows.routes";

dotenv.config();

// Validate environment variables
const requiredEnvVars = ["JAVA_BACKEND_BASE_URL", "JWT_SECRET", "ALLOWED_ORIGINS"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false,
}));

// Disable x-powered-by
app.disable("x-powered-by");

// CORS Configuration - Strict origin matching
const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS?.split(",") ?? [];
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn("CORS blocked request", { origin });
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-ID"],
}));

// Body Parser with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie Parser
app.use(cookieParser());

// Logging
app.use(morgan(morganFormat));

// Track request start time for latency logging
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  (req as any)._startTime = Date.now();
  next();
});

// Correlation ID middleware
app.use(correlationMiddleware);

// Health Check (no auth required)
app.get("/health", (_: express.Request, res: express.Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/workflows", workflowRoutes);

// Public rate limiter for unauthenticated routes
app.use("/api/auth", publicRateLimiter);

// 404 Handler
app.use((req: express.Request, res: express.Response) => {
  logger.warn("Route not found", { path: req.path, method: req.method });
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
      details: [],
    },
  });
});

// Global Error Handler (must be last)
app.use(errorMiddleware);

export default app;