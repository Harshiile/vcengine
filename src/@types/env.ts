import { z } from "zod";
export const envSchema = z.object({
  PORT: z.string(),
});
