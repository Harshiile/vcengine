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
