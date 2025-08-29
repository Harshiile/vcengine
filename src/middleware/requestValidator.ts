import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject } from "zod";

export const requestValidator = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(err.message);
      }
      throw new Error("Validation Error");
    }
  };
};
