import z from "zod";

export const workspaceCreateSchema = z.object({
  body: z.object({
    name: z.string(),
    type: z.enum(["Public", "Private"]),
  }),
});

export const getWorkspaceSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});
