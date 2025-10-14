import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string(),
  JWT_SECRET: z.string(),
  DB_URL: z.string(),
  IAM_ACCESS_KEY_ID: z.string(),
  IAM_SECRET_KEY: z.string(),
  ACCESS_TOKEN_EXPIRY: z.string(),
  ACCESS_TOKEN_NAME: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  MAIL_EMAIL: z.string(),
  MAIL_PASSKEY: z.string(),
  FRONT_END_URL: z.string(),
});
