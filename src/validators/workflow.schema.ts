import { z } from "zod";

/**
 * Get workflows schema
 */
export const getWorkflowsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(["pending", "running", "completed", "failed"]).optional(),
  }).optional(),
});

/**
 * Get workflow by ID schema
 */
export const getWorkflowByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid workflow ID format"),
  }),
});
