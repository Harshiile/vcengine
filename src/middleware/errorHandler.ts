import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message;

  if (err instanceof Error) message = err.message;
  else message = "Zod Error";
  return res.status(500).json({
    success: false,
    message,
  });
};
