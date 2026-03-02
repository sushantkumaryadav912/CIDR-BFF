import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

export interface JwtPayload {
  user_id: string;
  org_id: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  token?: string;
}

/**
 * JWT Authentication Middleware
 * Validates JWT from HTTP-only cookie
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      logger.error("JWT_SECRET environment variable is not set");
      res.status(500).json({
        error: {
          code: "CONFIGURATION_ERROR",
          message: "Server configuration error",
          details: [],
        },
      });
      return;
    }

    // Read JWT from HTTP-only cookie
    const token = req.cookies?.jwt;

    if (!token) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication token not found",
          details: [],
        },
      });
      return;
    }

    // Verify JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // Validate required fields
      if (!decoded.user_id || !decoded.org_id || !decoded.role) {
        throw new Error("Invalid token payload");
      }

      // Attach user info to request
      (req as AuthenticatedRequest).user = decoded;
      (req as AuthenticatedRequest).token = token;

      logger.debug("Authentication successful", {
        user_id: decoded.user_id,
        org_id: decoded.org_id,
        role: decoded.role,
      });

      next();
    } catch (jwtError: any) {
      if (jwtError.name === "TokenExpiredError") {
        res.status(401).json({
          error: {
            code: "TOKEN_EXPIRED",
            message: "Authentication token has expired",
            details: [],
          },
        });
        return;
      }

      if (jwtError.name === "JsonWebTokenError") {
        res.status(401).json({
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid authentication token",
            details: [],
          },
        });
        return;
      }

      throw jwtError;
    }
  } catch (error) {
    logger.error("Authentication middleware error", error);
    res.status(401).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        message: "Authentication failed",
        details: [],
      },
    });
  }
};