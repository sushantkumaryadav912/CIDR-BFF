import { z } from "zod";

/**
 * Search logs schema
 */
export const searchLogsSchema = z.object({
  query: z.object({
    q: z.string().max(500).optional(),
    start_time: z.string().datetime().optional(),
    end_time: z.string().datetime().optional(),
    log_level: z.enum(["debug", "info", "warn", "error", "critical"]).optional(),
    source: z.string().max(255).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});
