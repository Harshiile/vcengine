import { z } from "zod";
export const envSchema = z.object({
  PORT: z.string(),
  JWT_SECRET: z.string(),
  DB_URL: z.string(),
});
