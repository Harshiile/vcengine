import { z } from "zod";
export const envSchema = z.object({
  PORT: z.string(),
  JWT_SECRET: z.string(),
  DB_URL: z.string(),
  DRIVE_VIDEO_FOLDER_ID: z.string(),
  DRIVE_SERVICE_ACCOUNT_CREDENTIALS: z.string(),
});
