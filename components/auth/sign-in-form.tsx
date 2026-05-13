"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginType } from "@/lib/validations/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

import { GoogleAuthButton } from "./google-auth-button";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginType) => {
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          throw new Error("Invalid email or password.");
        } else {
          throw new Error(result.error || "An unexpected error occurred.");
        }
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F9F6EF] px-4 py-12">
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply"
        aria-hidden="true"
      />

      {/* Vintage newspaper background lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        aria-hidden="true"
      >
        <div className="h-full w-px bg-[#2C2B28] absolute left-5 md:left-20" />
        <div className="h-full w-px bg-[#2C2B28] absolute right-5 md:right-20" />
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#F9F6EF] border-2 border-[#2C2B28] p-8 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] space-y-8 relative">
          {/* Vintage top double border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#2C2B28]" />
          <div className="absolute top-2 left-0 w-full h-px bg-[#2C2B28]" />

          {/* Header */}
          <div className="space-y-3 text-center pt-2">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#2C2B28] uppercase leading-[1.1]">
              Welcome Back
            </h2>
          </div>

          {/* Google Auth */}
          <GoogleAuthButton actionText="Sign in" />

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute w-full border-t border-[#2C2B28]/20 border-dashed" />
            <span className="relative px-4 bg-[#F9F6EF] text-[#3A3126] text-[0.65rem] font-mono uppercase tracking-[0.2em] font-bold">
              Or continue with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[0.7rem] font-mono font-bold uppercase tracking-wider text-[#2C2B28] mb-2">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-3 bg-[#F9F6EF] border-2 border-[#2C2B28] focus:outline-none focus:ring-0 focus:bg-white transition-colors text-[#2C2B28] font-serif placeholder:font-serif placeholder:italic placeholder:text-[#6B5E4A]/50"
                placeholder="reader@broadsheet.com"
              />
              {errors.email && (
                <p className="text-[#9B2C2C] text-xs mt-2 font-mono font-bold uppercase tracking-wider">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[0.7rem] font-mono font-bold uppercase tracking-wider text-[#2C2B28]">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[#6B5E4A] hover:text-[#9B2C2C] hover:underline decoration-2 underline-offset-4 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-3 bg-[#F9F6EF] border-2 border-[#2C2B28] focus:outline-none focus:ring-0 focus:bg-white transition-colors text-[#2C2B28] font-serif placeholder:font-serif placeholder:italic placeholder:text-[#6B5E4A]/50"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-[#9B2C2C] text-xs mt-2 font-mono font-bold uppercase tracking-wider">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 text-[0.75rem] font-mono uppercase font-bold tracking-wide text-[#F9F6EF] bg-[#9B2C2C] border-2 border-[#2C2B28]">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full py-4 px-6 bg-[#2C2B28] text-[#F9F6EF] font-mono font-bold text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#5A3A2A] shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          {/* Footer Links - Back to Home + Explore */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-[#2C2B28]/20">
            <Link
              href="/"
              className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[#6B5E4A] hover:text-[#2C2B28] transition-colors hover:underline decoration-2 underline-offset-4"
            >
              ← Back to Home
            </Link>

            <span className="text-[#2C2B28]/20 text-sm hidden sm:inline">
              •
            </span>

            <Link
              href="/matches/2026"
              className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[#6B5E4A] hover:text-[#2C2B28] transition-colors hover:underline decoration-2 underline-offset-4"
            >
              Explore All Matches →
            </Link>
          </div>

          {/* Sign Up Redirect */}
          <div className="text-[0.7rem] font-mono font-bold uppercase tracking-wider text-center text-[#6B5E4A]">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-[#9B2C2C] hover:text-[#2C2B28] hover:underline decoration-2 underline-offset-4 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
