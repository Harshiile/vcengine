import { z } from "zod";
export const envSchema = z.object({
  PORT: z.string(),
  JWT_SECRET: z.string(),
  DB_URL: z.string(),
  DEFAULT_AVATAR: z.string(),
  IAM_ACCESS_KEY_ID: z.string(),
  IAM_SECRET_KEY: z.string(),
  ACCESS_TOKEN_EXPIRY: z.string(),
  ACCESS_TOKEN_NAME: z.string(),
});
