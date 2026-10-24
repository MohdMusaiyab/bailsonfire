import { z } from "zod";

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password must be 72 characters or fewer.");

export const RegisterSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: PasswordSchema,
  name: z.string().min(2, "Name is too short.").max(50).nullish(),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required.").max(72, "Password too long."),
});

export const VerifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be exactly 6 characters."),
  type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"]),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  otp: z.string().length(6, "OTP must be exactly 6 characters."),
  password: PasswordSchema,
});

export type RegisterType = z.infer<typeof RegisterSchema>;
export type LoginType = z.infer<typeof LoginSchema>;
export type VerifyOTPType = z.infer<typeof VerifyOTPSchema>;
export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;
