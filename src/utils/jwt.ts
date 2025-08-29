import { sign, verify } from "jsonwebtoken";
import { ENV } from "../config/env";

export const JwtGenerate = (payload: any) => {
  return sign(payload, ENV.JWT_SECRET);
};

export const JwtValidate = <T>(token: string): T => {
  return verify(token, ENV.JWT_SECRET) as T;
};
