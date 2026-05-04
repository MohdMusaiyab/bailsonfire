import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/mail";

// A standard API Response Type for consistency
export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

/**
 * Generates a random 6-digit numeric OTP.
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = RegisterSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        message: "Invalid fields provided" 
      }, { status: 400 });
    }

    const { email, password, name } = validatedData.data;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Email is already in use" },
        { status: 400 }
      );
    }

    // 2. Hash password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true }
    });

    // 3. Generate and Save OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await prisma.verificationOTP.upsert({
      where: { 
        email_type: { 
          email, 
          type: "EMAIL_VERIFICATION" 
        } 
      },
      update: { 
        otp, 
        expiresAt 
      },
      create: {
        email,
        otp,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    // 4. Send Verification Email
    const emailResult = await sendVerificationEmail(email, otp);
    
    if (!emailResult.success) {
      console.error("[SIGNUP_MAIL_ERROR]", emailResult.message);
      // We don't fail the whole signup if mail fails (user is still created),
      // but we warn them in the success message that mail might be delayed.
      return NextResponse.json<ApiResponse>({ 
        success: true, 
        message: "Account created, but we had trouble sending the verification email. Please try resending it from the verification page.",
        data: newUser
      });
    }

    return NextResponse.json<ApiResponse>({ 
      success: true, 
      message: "Account created! Please check your email for the verification code.", 
      data: newUser 
    });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json<ApiResponse>({ 
      success: false, 
      message: "Internal Server Error" 
    }, { status: 500 });
  }
}
