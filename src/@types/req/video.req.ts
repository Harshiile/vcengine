import { z } from "zod";
import { notProvidedError } from "./utils/not-provided";

export const videoSchema = z.object({
  workspaceId: z.string(),
  branch: z.string(),
  video: z.file(notProvidedError("Video")),
});

export const commentSchema = z.object({
  message: z.string(notProvidedError("Message")),
  commentedOn: z.string(),
  timestamp: z.number(notProvidedError("Timestamp")),
});
export const issueSchema = z.object({
  workspaceId: z.string(),
  createdOn: z.string(),
  message: z.string(notProvidedError("Message")),
  commentedOn: z.string(),
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
