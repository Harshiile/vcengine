import { z } from "zod";
import { notProvidedError } from "./utils/not-provided";


export const loginUserSchema = z.object({
  body: z.object({
    email: z.email(notProvidedError("Email")),
    password: z.string().min(8, { error: "Password is too short" }),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    username: z.string().optional(),
    avatarUrl: z.string().optional()
  }),
});

export const signupUserSchema = z.object({
  body: z.object({
    email: z.email(notProvidedError("Email")),
    username: z.string(notProvidedError("Username")),
    name: z.string(notProvidedError("Name")),
    avatar: z
      .string()
      .optional(),
    password: z.string().min(8, { error: "Password is too short" }),
  }),
});

export const uploadAvatarSchema = z.object({
  body: z.object({
    contentType: z.string(notProvidedError("Content Type")),
  }),
});

export const isUsernameUniqueSchema = z.object({
  params: z.object({
    username: z.string(notProvidedError("Username")),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    userId: z.string(notProvidedError("Username")),
  }),
});
