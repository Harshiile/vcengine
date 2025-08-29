import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message;
  if (err instanceof ZodError) {
    message = JSON.parse(err.message)[0].message;
  } else message = err.message;
  return res.status(500).json({
    success: false,
    message,
  });
};
