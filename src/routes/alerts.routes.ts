import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  getAlertsSchema,
  getAlertByIdSchema,
  approveAlertSchema,
  markFalsePositiveSchema,
} from "../validators/alert.schema";
import { authenticatedRateLimiter } from "../middleware/rate-limit.middleware";
import { javaApiService } from "../services/java-api.service";
import { formatSuccessResponse } from "../utils/response-formatter";
import { logger } from "../utils/logger";

const router = Router();

// Apply authentication and rate limiting to all alert routes
router.use(authMiddleware);
router.use(authenticatedRateLimiter);

/**
 * GET /api/alerts
 * Get list of alerts
 */
router.get(
  "/",
  validate(getAlertsSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const correlationId = (req as any).correlationId;
      const token = req.token!;
      const orgId = req.user!.org_id;

      logger.info("Fetching alerts", { orgId, query: req.query });

      // Build query string
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `/api/v1/alerts${queryString ? `?${queryString}` : ""}`;

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

/**
 * GET /api/alerts/:id
 * Get alert by ID
 */
router.get(
  "/:id",
  validate(getAlertByIdSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const correlationId = (req as any).correlationId;
      const token = req.token!;
      const orgId = req.user!.org_id;
      const alertId = req.params.id;

      logger.info("Fetching alert by ID", { orgId, alertId });

      // Forward to Java backend
      const response = await javaApiService.get<any>(`/api/v1/alerts/${alertId}`, {
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

/**
 * POST /api/alerts/:id/approve
 * Approve alert for remediation
 */
router.post(
  "/:id/approve",
  validate(approveAlertSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const correlationId = (req as any).correlationId;
      const token = req.token!;
      const orgId = req.user!.org_id;
      const alertId = req.params.id;

      logger.info("Approving alert", { orgId, alertId });

      // Forward to Java backend
      const response = await javaApiService.post<any>(
        `/api/v1/alerts/${alertId}/approve`,
        req.body,
        { token, orgId, correlationId }
      );

      res.status(200).json(formatSuccessResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/alerts/:id/false-positive
 * Mark alert as false positive
 */
router.post(
  "/:id/false-positive",
  validate(markFalsePositiveSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const correlationId = (req as any).correlationId;
      const token = req.token!;
      const orgId = req.user!.org_id;
      const alertId = req.params.id;

      logger.info("Marking alert as false positive", { orgId, alertId });

      // Forward to Java backend
      const response = await javaApiService.post<any>(
        `/api/v1/alerts/${alertId}/false-positive`,
        req.body,
        { token, orgId, correlationId }
      );

      res.status(200).json(formatSuccessResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
