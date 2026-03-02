import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Global error handling middleware
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error with correlation ID
  const correlationId = (req as any).correlationId;
  logger.error("Global error handler", err, { correlationId, path: req.path });

  // Handle Java backend errors
  if (err.status && err.code) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message || "Error from backend",
        details: err.details || [],
      },
    });
    return;
  }

  // Handle timeout errors
  if (err.code === "GATEWAY_TIMEOUT") {
    res.status(504).json({
      error: {
        code: "GATEWAY_TIMEOUT",
        message: "Request timeout",
        details: [],
      },
    });
    return;
  }

  // Handle rate limit errors
  if (err.status === 429) {
    res.status(429).json({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: err.message || "Rate limit exceeded",
        details: [],
      },
    });
    return;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: err.message || "Validation failed",
        details: err.details || [],
      },
    });
    return;
  }

  // Handle unknown errors (never expose stack traces in production)
  const status = err.status || 500;
  const message = process.env.NODE_ENV === "production"
    ? "Internal Server Error"
    : (err.message || "Internal Server Error");

  res.status(status).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message,
      details: [],
    },
  });
};