import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { searchLogsSchema } from "../validators/log.schema";
import { authenticatedRateLimiter } from "../middleware/rate-limit.middleware";
import { javaApiService } from "../services/java-api.service";
import { formatSuccessResponse } from "../utils/response-formatter";
import { logger } from "../utils/logger";

const router = Router();

// Apply authentication and rate limiting
router.use(authMiddleware);
router.use(authenticatedRateLimiter);

/**
 * GET /api/logs/search
 * Search logs
 */
router.get(
  "/search",
  validate(searchLogsSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const correlationId = (req as any).correlationId;
      const token = req.token!;
      const orgId = req.user!.org_id;

      logger.info("Searching logs", { orgId, query: req.query });

      // Build query string
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `/api/v1/logs/search${queryString ? `?${queryString}` : ""}`;

      // Forward to Java backend
      const response = await javaApiService.get<any>(url, {
        token,
        orgId,
        correlationId,
      });

      res.status(200).json(formatSuccessResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
