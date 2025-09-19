import { NextFunction, Request, Response } from "express";
import { JwtValidate } from "../utils/jwt";
import z from "zod";
import { tokenSchema } from "../@types/token";
import { VCError } from "../utils/error";
import { ENV } from "../config/env";

type tokenSchemaType = z.infer<typeof tokenSchema>;

export const authValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies[ENV.ACCESS_TOKEN_NAME];

  if (!accessToken) throw new VCError(404, "Credentials not found");

  try {
    const { userId } = JwtValidate<tokenSchemaType>(accessToken);
    req.user = userId;
    next();
  } catch (error) {
    res.status(403);
    throw new VCError(401, "Unauthorized User");
  }
};
