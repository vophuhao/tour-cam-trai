import { z } from "zod";
import { emailSchema, passwordSchema } from "./common.validator";

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});

export const registerSchema = loginSchema
  .extend({
    username: z.string().min(2).max(100),
    confirmPassword: passwordSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verificationCodeSchema = z.string().min(1).max(24);

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  verificationCode: verificationCodeSchema,
});

export type CreateAccountParams = z.infer<typeof registerSchema>;
export type LoginParams = z.infer<typeof loginSchema>;
export type ResetPasswordParams = z.infer<typeof resetPasswordSchema>;
