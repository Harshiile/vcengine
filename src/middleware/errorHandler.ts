import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(500).json({
    success: false,
    message: JSON.parse(err.message)[0].message,
  });
};
