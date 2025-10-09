import z from "zod";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string(),
    branchName: z.string(),
    type: z.enum(["Public", "Private"]),
    banner: z.string()
  }),
});

export const getWorkspaceSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});

export const getVersionsSchema = z.object({
  params: z.object({
    workspaceId: z.string(),
  }),
});
