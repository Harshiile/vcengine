import { NextFunction, Request, Response } from "express";
import { VCError } from "../utils/error";

export const errorHandler = (
  err: VCError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Unvalid Error";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
