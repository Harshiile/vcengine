import { z } from "zod";
import { notProvidedError } from "./utils/not-provided";

export const videoUploadSchema = z.object({
  body: z.object({
    // workspace: z.string(),
    // title: z.string(),
    // video: z.file(notProvidedError("Video")),
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
