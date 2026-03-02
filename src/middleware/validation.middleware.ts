import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../utils/logger";

/**
 * Generic validation middleware factory
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate content-type for POST/PUT requests
      if (["POST", "PUT"].includes(req.method) && req.body) {
        const contentType = req.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          res.status(415).json({
            error: {
              code: "UNSUPPORTED_MEDIA_TYPE",
              message: "Content-Type must be application/json",
              details: [],
            },
          });
          return;
        }
      }

      // Parse and validate request
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any;

      // Replace request data with validated data (strips unknown fields)
      req.body = validated.body || {};
      req.query = validated.query || {};
      req.params = validated.params || {};

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        logger.warn("Validation error", { details });

        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Request validation failed",
            details,
          },
        });
        return;
      }

      logger.error("Validation middleware error", error);
      res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal validation error",
          details: [],
        },
      });
    }
  };
};