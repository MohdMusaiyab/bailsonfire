import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  // Notice .nullish(). This safely handles Prisma 'null' and TypeScript 'undefined' mismatch!
  name: z.string().min(2, "Name is too short.").max(50).nullish(),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const VerifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be exactly 6 characters."),
  type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"]),
});

export type RegisterType = z.infer<typeof RegisterSchema>;
export type LoginType = z.infer<typeof LoginSchema>;
export type VerifyOTPType = z.infer<typeof VerifyOTPSchema>;
