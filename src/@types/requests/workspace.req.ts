import z from "zod";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string(),
    branchName: z.string(),
    type: z.enum(["Public", "Private"]),
    banner: z.string().optional()
  }),
});

export const getWorkspaceOfUserSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});

export const getWorkspaceDetailsSchema = z.object({
  params: z.object({
    workspaceId: z.string(),
  }),
});

export const getVersionsSchema = z.object({
  params: z.object({
    branchId: z.string(),
  }),
});

export const createBranchSchema = z.object({
  body: z.object({
    workspaceId: z.string(),
    createdFromVersion: z.string(),
    name: z.string()
  }),
});

export const getBranchSchema = z.object({
  params: z.object({
    workspaceId: z.string(),
  }),
});

export const isWorkspaceUniqueSchema = z.object({
  params: z.object({
    workspaceName: z.string(),
  }),
});

export const createNewVersionSchema = z.object({
  body: z.object({
    oldVersion: z.string(),
    commitMessage: z.string(),
    changes: z.array(z.object({
      type: z.enum(["ADD", "REPLACE", "REMOVE"]),
      startTimestamp: z.number(),
      endTimestamp: z.number().optional(),
      newSection: z.string().optional()
    }))
  }),
});
