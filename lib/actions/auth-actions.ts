"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import crypto from "crypto";
import { ApiResponse } from "@/app/api/auth/sign-up/route";
import { OTPType } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Handles generating and sending a new OTP.
 * Includes a 60-second cooldown per email/type.
 */
export async function requestVerificationOTP(providedEmail?: string): Promise<ApiResponse & { resendAvailableAt?: Date }> {
  console.log("[SERVER ACTION] requestVerificationOTP =========== START ===========");
  
  const session = await auth();
  const email = session?.user?.email || providedEmail;

  if (!email) {
    console.log("[SERVER ACTION] No email source found - returning error");
    return { success: false, message: "Email is required to request a verification code." };
  }

  console.log("[SERVER ACTION] Targeting email:", email);

  try {
    // 1. Check for existing OTP cooldown (60 seconds)
    const existingOTP = await prisma.verificationOTP.findUnique({
      where: {
        email_type: { email, type: OTPType.EMAIL_VERIFICATION },
      },
    });

    if (existingOTP) {
      const secondsSinceCreation = (Date.now() - existingOTP.createdAt.getTime()) / 1000;
      if (secondsSinceCreation < 60) {
        return {
          success: false,
          message: `Please wait ${Math.ceil(60 - secondsSinceCreation)}s before resending.`,
          resendAvailableAt: new Date(existingOTP.createdAt.getTime() + 60000),
        };
      }
    }

    // 2. Generate a 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 3. Upsert into DB
    await prisma.verificationOTP.upsert({
      where: { email_type: { email, type: OTPType.EMAIL_VERIFICATION } },
      update: { otp, expiresAt, createdAt: new Date() },
      create: { email, otp, expiresAt, type: OTPType.EMAIL_VERIFICATION },
    });

    // 4. Send Email
    const emailResult = await sendVerificationEmail(email, otp);
    
    if (!emailResult.success) {
      return { success: false, message: "Failed to send verification email. Try again later." };
    }

    return { 
      success: true, 
      message: "A verification code has been sent to your email.",
      resendAvailableAt: new Date(Date.now() + 60000)
    };
  } catch (error) {
    console.error("[OTP_REQUEST_ERROR]", error);
    return { success: false, message: "Internal server error." };
  }
}

/**
 * Verifies the 6-digit OTP provided by the user.
 */
export async function verifyEmailOTP(otp: string, providedEmail?: string): Promise<ApiResponse> {
  console.log("[SERVER ACTION] verifyEmailOTP =========== START ===========");
  
  const session = await auth();
  const email = session?.user?.email || providedEmail;

  if (!email) {
    return { success: false, message: "Email is required for verification." };
  }

  try {
    const record = await prisma.verificationOTP.findUnique({
      where: { email_type: { email, type: OTPType.EMAIL_VERIFICATION } },
    });

    if (!record || record.otp !== otp) {
      return { success: false, message: "Invalid verification code." };
    }

    if (new Date() > record.expiresAt) {
      return { success: false, message: "Verification code has expired." };
    }

    // Success: Update User and delete OTP
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationOTP.delete({
        where: { id: record.id },
      }),
    ]);
    
    return { success: true, message: "Email successfully verified!" };
  } catch (error) {
    console.error("[OTP_VERIFY_ERROR]", error);
    return { success: false, message: "Internal server error." };
  }
}

/**
 * Handles requesting an OTP for password reset.
 */
export async function requestPasswordResetOTP(email: string): Promise<ApiResponse & { resendAvailableAt?: Date }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { 
        success: true, 
        message: "If an account with that email exists, a verification code has been sent." 
      };
    }

    const existingOTP = await prisma.verificationOTP.findUnique({
      where: {
        email_type: { email, type: OTPType.PASSWORD_RESET },
      },
    });

    if (existingOTP) {
      const secondsSinceCreation = (Date.now() - existingOTP.createdAt.getTime()) / 1000;
      if (secondsSinceCreation < 60) {
        return {
          success: false,
          message: `Please wait ${Math.ceil(60 - secondsSinceCreation)}s before resending.`,
          resendAvailableAt: new Date(existingOTP.createdAt.getTime() + 60000),
        };
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationOTP.upsert({
      where: { email_type: { email, type: OTPType.PASSWORD_RESET } },
      update: { otp, expiresAt, createdAt: new Date() },
      create: { email, otp, expiresAt, type: OTPType.PASSWORD_RESET },
    });

    const emailResult = await sendVerificationEmail(email, otp);
    if (!emailResult.success) {
      return { success: false, message: "Failed to send email. Try again later." };
    }

    return { 
      success: true, 
      message: "If an account with that email exists, a verification code has been sent.",
      resendAvailableAt: new Date(Date.now() + 60000)
    };
  } catch (error) {
    console.error("[PASSWORD_RESET_REQUEST_ERROR]", error);
    return { success: false, message: "Internal server error." };
  }
}

/**
 * Verifies the password reset OTP without deleting it.
 */
export async function verifyPasswordResetOTP(email: string, otp: string): Promise<ApiResponse> {
  try {
    const record = await prisma.verificationOTP.findUnique({
      where: { email_type: { email, type: OTPType.PASSWORD_RESET } },
    });

    if (!record || record.otp !== otp) {
      return { success: false, message: "Invalid verification code." };
    }

    if (new Date() > record.expiresAt) {
      return { success: false, message: "Verification code has expired." };
    }

    return { success: true, message: "Code verified. Please set your new password." };
  } catch (error) {
    console.error("[PASSWORD_RESET_VERIFY_ERROR]", error);
    return { success: false, message: "Internal server error." };
  }
}

/**
 * Executes the final password reset.
 */
export async function executePasswordReset(email: string, otp: string, password: string): Promise<ApiResponse> {
  try {
    const record = await prisma.verificationOTP.findUnique({
      where: { email_type: { email, type: OTPType.PASSWORD_RESET } },
    });

    if (!record || record.otp !== otp) {
      return { success: false, message: "Invalid or expired verification session. Please restart." };
    }

    if (new Date() > record.expiresAt) {
      return { success: false, message: "Verification code has expired. Please restart." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.verificationOTP.delete({
        where: { id: record.id },
      }),
    ]);

    return { success: true, message: "Password has been reset successfully. Please sign in." };
  } catch (error) {
    console.error("[PASSWORD_RESET_EXECUTE_ERROR]", error);
    return { success: false, message: "Internal server error." };
  }
}