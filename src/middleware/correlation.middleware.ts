import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const correlationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = uuidv4();
  res.setHeader("X-Correlation-ID", correlationId);
  (req as any).correlationId = correlationId;
  next();
};