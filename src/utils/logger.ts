import morgan from "morgan";
import { Request, Response } from "express";

/**
 * Mask sensitive data in logs
 */
export const maskSensitiveData = (data: any): any => {
  if (typeof data !== "object" || data === null) return data;

  const masked = { ...data };
  const sensitiveKeys = ["password", "token", "authorization", "jwt", "secret", "api_key", "apiKey"];

  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      masked[key] = "***MASKED***";
    } else if (typeof masked[key] === "object") {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
};

/**
 * Structured logger
 */
export const logger = {
  info: (message: string, meta?: any) => {
    const log = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      ...(meta ? { meta: maskSensitiveData(meta) } : {}),
    };
    console.log(JSON.stringify(log));
  },

  error: (message: string, error?: any, meta?: any) => {
    const log = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      ...(error ? { error: process.env.NODE_ENV === "production" ? error.message : error } : {}),
      ...(meta ? { meta: maskSensitiveData(meta) } : {}),
    };
    console.error(JSON.stringify(log));
  },

  warn: (message: string, meta?: any) => {
    const log = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      ...(meta ? { meta: maskSensitiveData(meta) } : {}),
    };
    console.warn(JSON.stringify(log));
  },

  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== "production") {
      const log = {
        level: "debug",
        message,
        timestamp: new Date().toISOString(),
        ...(meta ? { meta: maskSensitiveData(meta) } : {}),
      };
      console.debug(JSON.stringify(log));
    }
  },
};

/**
 * Morgan token for latency logging
 */
morgan.token("latency", (req: Request, res: Response) => {
  const start = (req as any)._startTime;
  if (!start) return "0";
  return `${Date.now() - start}ms`;
});

/**
 * Custom morgan format with correlation ID
 */
export const morganFormat = ":method :url :status :latency - :res[content-length] - :remote-addr";
