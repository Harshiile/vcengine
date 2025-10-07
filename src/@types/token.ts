import z from "zod";

export const tokenSchema = z.object({
  userId: z.string(),
  email: z.string(),
  iat: z.number(),
});
