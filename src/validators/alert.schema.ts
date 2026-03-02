import { z } from "zod";

/**
 * Get alerts query schema
 */
export const getAlertsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
    status: z.enum(["open", "investigating", "resolved", "false_positive"]).optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
  }).optional(),
});

/**
 * Get alert by ID schema
 */
export const getAlertByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid alert ID format"),
  }),
});

/**
 * Approve alert schema
 */
export const approveAlertSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid alert ID format"),
  }),
  body: z.object({
    remediation_action: z.enum(["block_ip", "quarantine_user", "disable_service", "manual"]).optional(),
    notes: z.string().max(1000).optional(),
  }).optional(),
});

/**
 * Mark alert as false positive schema
 */
export const markFalsePositiveSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid alert ID format"),
  }),
  body: z.object({
    reason: z.string().max(1000),
  }),
});
