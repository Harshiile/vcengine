import { z } from "zod";

export const uploadVideoSchema = z.object({
  body: z.object({
    contentType: z.string(),
    commitMessage: z.string(),
    workspace: z.string(),
    branch: z.string(),
  }),
});

export const getPlaylistSchema = z.object({
  params: z.object({
    version: z.string(),
    workspace: z.string(),
    resolution: z.string(),
  }),
});
export const getSegmentSchema = z.object({
  params: z.object({
    segmentHash: z.string(),
  }),
});

export const getMaxResolutionSchema = z.object({
  params: z.object({
    workspace: z.string(),
  }),
});
