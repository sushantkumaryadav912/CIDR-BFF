import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { getWorkflowsSchema, getWorkflowByIdSchema } from "../validators/workflow.schema";
import { authenticatedRateLimiter } from "../middleware/rate-limit.middleware";
import { javaApiService } from "../services/java-api.service";
import { formatSuccessResponse } from "../utils/response-formatter";
import { logger } from "../utils/logger";

const router = Router();

// Apply authentication and rate limiting
router.use(authMiddleware);
router.use(authenticatedRateLimiter);

/**
 * GET /api/workflows
 * Get list of workflows
 */
router.get(
  "/",
  validate(getWorkflowsSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const correlationId = (req as any).correlationId;
      const token = req.token!;
      const orgId = req.user!.org_id;

      logger.info("Fetching workflows", { orgId, query: req.query });

      // Build query string
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `/api/v1/workflows${queryString ? `?${queryString}` : ""}`;

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
 * GET /api/workflows/:id
 * Get workflow by ID
 */
router.get(
  "/:id",
  validate(getWorkflowByIdSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const correlationId = (req as any).correlationId;
      const token = req.token!;
      const orgId = req.user!.org_id;
      const workflowId = req.params.id;

      logger.info("Fetching workflow by ID", { orgId, workflowId });

      // Forward to Java backend
      const response = await javaApiService.get<any>(`/api/v1/workflows/${workflowId}`, {
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
