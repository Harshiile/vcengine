import z from "zod";
import { notProvidedError } from "./utils/not-provided";


export const getSignedUrlSchema = z.object({
    body: z.object({
        type: z.enum(["banner", "avatar", "clip"]),
        contentType: z.string(notProvidedError("Content Type")),
    }),
});

export const getImageContentSchema = z.object({
    params: z.object({
        type: z.enum(["banner", "avatar"]),
        fileId: z.string()
    }),
});
