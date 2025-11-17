import { z } from "zod";

export const loginSchema = z.object({
  userId: z.string().min(1, "userId is required").max(50),
});

export const userIdParamSchema = z.object({
  userId: z.string().min(1, "userId is required").max(50),
});

export const requestTokenSchema = z.object({
  request_token: z.string().min(1, "request_token is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type RequestTokenQuery = z.infer<typeof requestTokenSchema>;
