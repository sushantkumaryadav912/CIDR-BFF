import { Router, Response } from "express";
import { validate } from "../middleware/validation.middleware";
import { loginSchema, refreshSchema, logoutSchema } from "../validators/auth.schema";
import { loginRateLimiter } from "../middleware/rate-limit.middleware";
import { javaApiService } from "../services/java-api.service";
import { formatSuccessResponse } from "../utils/response-formatter";
import { logger } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * POST /api/auth/login
 * Login user and set JWT cookie
 */
router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const correlationId = (req as any).correlationId;

      logger.info("Login attempt", { email: req.body.email });

      // Forward to Java backend
      const response = await javaApiService.post<any>(
        "/api/v1/auth/login",
        req.body,
        { correlationId }
      );

      // Set HTTP-only cookie with JWT
      if (response.token) {
        res.cookie("jwt", response.token, COOKIE_OPTIONS);
      }

      logger.info("Login successful", { email: req.body.email });

      res.status(200).json(formatSuccessResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post(
  "/refresh",
  validate(refreshSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const correlationId = (req as any).correlationId;
      const token = req.cookies?.jwt;

      if (!token) {
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "No token found",
            details: [],
          },
        });
        return;
      }

      // Forward to Java backend
      const response = await javaApiService.post<any>(
        "/api/v1/auth/refresh",
        {},
        { token, correlationId }
      );

      // Update cookie with new JWT
      if (response.token) {
        res.cookie("jwt", response.token, COOKIE_OPTIONS);
      }

      logger.info("Token refresh successful");

      res.status(200).json(formatSuccessResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user and clear JWT cookie
 */
router.post(
  "/logout",
  validate(logoutSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const correlationId = (req as any).correlationId;
      const token = req.cookies?.jwt;

      // Clear cookie
      res.clearCookie("jwt", COOKIE_OPTIONS);

      // Optionally notify Java backend
      if (token) {
        try {
          await javaApiService.post("/api/v1/auth/logout", {}, { token, correlationId });
        } catch (error) {
          // Ignore Java backend errors on logout
          logger.warn("Java backend logout failed", { error });
        }
      }

      logger.info("Logout successful");

      res.status(200).json(formatSuccessResponse({ message: "Logged out successfully" }));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
