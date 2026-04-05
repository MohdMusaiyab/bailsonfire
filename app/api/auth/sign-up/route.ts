import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validations/auth";

// A standard API Response Type for consistency
export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

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

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Email is already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true } // Don't return password hash
    });

    return NextResponse.json<ApiResponse>({ 
      success: true, 
      message: "Account successfully created!", 
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
