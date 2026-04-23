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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FCFBF7] px-4 py-12">
      {/* Subtle floating background orbs (matching Hero & SignUp theme) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute rounded-full bg-[#1A1A1A]/5 blur-3xl"
          style={{ width: "400px", height: "400px", left: "-10%", top: "20%" }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full bg-[#1A1A1A]/5 blur-3xl"
          style={{ width: "500px", height: "500px", right: "-15%", bottom: "10%" }}
          animate={{ x: [0, -40, 0], y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full bg-emerald-500/5 blur-3xl"
          style={{ width: "300px", height: "300px", left: "20%", bottom: "30%" }}
          animate={{ x: [0, 20, 0], y: [0, -15, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#1A1A1A]/10 p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-black tracking-tight text-[#1A1A1A]">
              Welcome{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#1A1A1A]/50">
                Back
              </span>
            </h2>
            <p className="text-[#4A4A4A] text-sm font-medium">
              Sign in to BailsOnFire to continue the roast.
            </p>
          </div>

          {/* Google Auth */}
          <GoogleAuthButton actionText="Sign in" />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1A1A1A]/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/80 backdrop-blur-sm text-[#4A4A4A] font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-2.5 bg-white border border-[#1A1A1A]/20 rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] outline-none transition-all text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-[#1A1A1A]">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#1A1A1A]/60 font-medium hover:text-[#1A1A1A] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-2.5 bg-white border border-[#1A1A1A]/20 rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] outline-none transition-all text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 text-white font-bold rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1A1A1A]/20"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          {/* Footer Links - Back to Home + Explore */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 border-t border-[#1A1A1A]/5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors group text-sm font-medium"
            >
              <svg
                className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>

            <span className="text-[#1A1A1A]/20 text-sm hidden sm:inline">•</span>

            <Link
              href="/matches/2026"
              className="inline-flex items-center gap-1.5 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors group text-sm font-medium"
            >
              Explore All Matches
              <svg
                className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Sign Up Redirect */}
          <div className="text-sm text-center text-[#4A4A4A]">
            Don{"\u2019"}t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-[#1A1A1A] font-bold hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}