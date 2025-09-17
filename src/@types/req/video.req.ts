import { z } from "zod";
import { notProvidedError } from "./utils/not-provided";

export const generateSignedURLSchema = z.object({
  body: z.object({
    contentType: z.string(),
    title: z.string(),
    workspace: z.string(),
    fileOriginalName: z.string(),
  }),
  params: z.object({
    type: z.enum(["video", "banner"]),
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
