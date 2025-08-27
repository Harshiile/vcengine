import { z } from "zod";
export const envSchema = z.object({
  PORT: z.string(),
  DRIVE_SERVICE_ACCOUNT_CREDENTIALS: z.string(),
});
