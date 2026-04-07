import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isVerified = !!req.auth?.user?.emailVerified;

  // 1. Logic for Auth Routes (/auth/sign-in, /auth/sign-up)
  const isAuthRoute = nextUrl.pathname.startsWith("/auth/sign-in") || 
                     nextUrl.pathname.startsWith("/auth/sign-up");

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Logic for Verification Route (/auth/verify-email)
  const isVerificationRoute = nextUrl.pathname.startsWith("/auth/verify-email");
  if (isVerificationRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/sign-in", nextUrl));
    }
    if (isVerified) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // 3. Logic for API Auth Routes (Don't intercept these)
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  if (isApiAuthRoute) return NextResponse.next();

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
