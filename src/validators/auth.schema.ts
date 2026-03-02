import { z } from "zod";

/**
 * Login request schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").max(255),
  }),
});

/**
 * Refresh token schema
 */
export const refreshSchema = z.object({
  body: z.object({}).optional(),
});

/**
 * Logout schema
 */
export const logoutSchema = z.object({
  body: z.object({}).optional(),
});
