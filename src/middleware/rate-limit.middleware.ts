import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Rate limiter for login endpoint
 * 5 attempts per 15 minutes per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many login attempts, please try again later",
      details: [],
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many login attempts, please try again later",
        details: [],
      },
    });
  },
});

/**
 * Rate limiter for authenticated endpoints
 * 100 requests per minute per org
 */
export const authenticatedRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyGenerator: (req: Request) => {
    // Rate limit by org_id from authenticated user
    const user = (req as any).user;
    if (user?.org_id) {
      return `org:${user.org_id}`;
    }
    // Fallback to IP (but we're rate limiting by org, not IP)
    return `ip:${req.ip || "unknown"}`;
  },
  validate: {
    // Disable IPv6 validation since we're primarily using org_id
    keyGeneratorIpFallback: false,
  },
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded",
      details: [],
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded",
        details: [],
      },
    });
  },
});

/**
 * Rate limiter for public endpoints
 * 50 requests per minute per IP
 */
export const publicRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded",
      details: [],
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded",
        details: [],
      },
    });
  },
});