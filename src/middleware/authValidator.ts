import { NextFunction, Request, Response } from "express";
import { JwtValidate } from "../utils/jwt";

export const authValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { "acs-tkn": accessToken } = req.cookies;

  if (!accessToken) throw new Error("Credentials not found");

  try {
    const data = JwtValidate(accessToken);
    console.log(data);
    next();
  } catch (error) {
    res.status(403);
    throw new Error("Unauthorized User");
  }
};
