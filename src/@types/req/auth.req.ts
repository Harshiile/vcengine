import { z } from "zod";
import { notProvidedError } from "./utils/not-provided";

export const loginSchema = z.object({
  body: z.object({
    email: z.email(notProvidedError("Email")),
    password: z.string().min(8, { error: "Password is too short" }),
  }),
});

export const signupSchema = z.object({
  body: z.object({
    email: z.email(notProvidedError("Email")),
    username: z.string(notProvidedError("Username")),
    name: z.string(notProvidedError("Name")),
    avatar: z
      .object({
        avatarExt: z.string(),
        avatarContentType: z.string(),
      })
      .optional(),
    password: z.string().min(8, { error: "Password is too short" }),
  }),
});
