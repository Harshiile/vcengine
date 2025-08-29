import { z } from "zod";
import { notProvidedError } from "./utils/not-provided";

export const workspaceSchema = z.object({
  name: z.email(notProvidedError("Name")),
  type: z.enum(["Public", "Private"]),
  banner: z.file().optional(),
});
export const branchSchema = z.object({
  name: z
    .string(notProvidedError("Name"))
    .max(10, { error: "Max size of name is 10" }),
});
