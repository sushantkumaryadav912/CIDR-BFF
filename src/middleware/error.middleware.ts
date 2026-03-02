import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    error: {
      code: err.code || "SERVER_ERROR",
      message: err.message || "Internal Server Error",
      details: err.details || [],
    },
  });
};