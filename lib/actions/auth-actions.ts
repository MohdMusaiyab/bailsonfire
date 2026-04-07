"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import crypto from "crypto";
import { ApiResponse } from "@/app/api/auth/sign-up/route";
import { OTPType } from "@prisma/client";

/**
 * Handles generating and sending a new OTP.
 * Includes a 60-second cooldown per email/type.
 */
export async function requestVerificationOTP(): Promise<ApiResponse & { resendAvailableAt?: Date }> {
  console.log("[SERVER ACTION] requestVerificationOTP =========== START ===========");
  
  const session = await auth();
  console.log("[SERVER ACTION] Session from auth():", JSON.stringify(session, null, 2));
  
  if (!session?.user?.email) {
    console.log("[SERVER ACTION] No authenticated user - returning error");
    return { success: false, message: "Unauthorized. Please log in first." };
  }

  const email = session.user.email;
  console.log("[SERVER ACTION] Email from session:", email);

  try {
    // 1. Check for existing OTP cooldown (60 seconds)
    const existingOTP = await prisma.verificationOTP.findUnique({
      where: {
        email_type: { email, type: OTPType.EMAIL_VERIFICATION },
      },
    });

    if (existingOTP) {
      const secondsSinceCreation = (Date.now() - existingOTP.createdAt.getTime()) / 1000;
      console.log("[SERVER ACTION] Existing OTP found, seconds since creation:", secondsSinceCreation);
      
      if (secondsSinceCreation < 60) {
        console.log("[SERVER ACTION] Cooldown active - returning error");
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
    console.log("[SERVER ACTION] Generated OTP:", otp);
    console.log("[SERVER ACTION] OTP expires at:", expiresAt);

    // 3. Upsert into DB
    await prisma.verificationOTP.upsert({
      where: { email_type: { email, type: OTPType.EMAIL_VERIFICATION } },
      update: { otp, expiresAt, createdAt: new Date() },
      create: { email, otp, expiresAt, type: OTPType.EMAIL_VERIFICATION },
    });
    console.log("[SERVER ACTION] OTP upserted to database");

    // 4. Send Email
    const emailResult = await sendVerificationEmail(email, otp);
    console.log("[SERVER ACTION] Email send result:", emailResult);
    
    if (!emailResult.success) {
      console.log("[SERVER ACTION] Email sending failed");
      return { success: false, message: "Failed to send verification email. Try again later." };
    }

    console.log("[SERVER ACTION] OTP request successful");
    console.log("[SERVER ACTION] =========== END ===========");
    
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
export async function verifyEmailOTP(otp: string): Promise<ApiResponse> {
  console.log("[SERVER ACTION] verifyEmailOTP =========== START ===========");
  console.log("[SERVER ACTION] Received OTP to verify:", otp);
  
  const session = await auth();
  console.log("[SERVER ACTION] Session from auth():", JSON.stringify(session, null, 2));
  
  if (!session?.user?.email) {
    console.log("[SERVER ACTION] No authenticated user - returning error");
    return { success: false, message: "Unauthorized." };
  }

  const email = session.user.email;
  console.log("[SERVER ACTION] Email from session:", email);

  try {
    const record = await prisma.verificationOTP.findUnique({
      where: { email_type: { email, type: OTPType.EMAIL_VERIFICATION } },
    });

    console.log("[SERVER ACTION] OTP record from DB:", record);
    
    if (!record || record.otp !== otp) {
      console.log("[SERVER ACTION] Invalid OTP - record exists:", !!record, "OTP matches:", record?.otp === otp);
      return { success: false, message: "Invalid verification code." };
    }

    if (new Date() > record.expiresAt) {
      console.log("[SERVER ACTION] OTP expired - expires at:", record.expiresAt, "Current time:", new Date());
      return { success: false, message: "Verification code has expired." };
    }

    console.log("[SERVER ACTION] OTP is valid - proceeding to update user");

    // Success: Update User and delete OTP
    const transactionResult = await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationOTP.delete({
        where: { id: record.id },
      }),
    ]);
    
    console.log("[SERVER ACTION] Transaction completed successfully");
    console.log("[SERVER ACTION] Updated user:", JSON.stringify(transactionResult[0], null, 2));
    console.log("[SERVER ACTION] New emailVerified value:", transactionResult[0].emailVerified);
    
    // Double-check the update was saved
    const verifyUser = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true }
    });
    console.log("[SERVER ACTION] Double-check - DB now shows emailVerified:", verifyUser?.emailVerified);

    console.log("[SERVER ACTION] Email verification successful!");
    console.log("[SERVER ACTION] =========== END ===========");
    
    return { success: true, message: "Email successfully verified!" };
  } catch (error) {
    console.error("[OTP_VERIFY_ERROR]", error);
    return { success: false, message: "Internal server error." };
  }
}