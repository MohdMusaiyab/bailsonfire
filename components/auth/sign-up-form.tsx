"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterType } from "@/lib/validations/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { GoogleAuthButton } from "./google-auth-button";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterType>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterType) => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message || "Something went wrong");
      }

      setSuccess(result.message);
      setTimeout(() => router.push("/auth/sign-in"), 2000);
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
      {/* Subtle floating background orbs */}
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
              Create an{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#1A1A1A]/50">
                Account
              </span>
            </h2>
            <p className="text-[#4A4A4A] text-sm font-medium">
              Join Bails on Fire to start commenting.
            </p>
          </div>

          {/* Google Auth */}
          <GoogleAuthButton actionText="Sign up" />

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
                Full Name
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-[#1A1A1A]/20 rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] outline-none transition-all text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

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
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">
                Password
              </label>
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

            {/* Status Messages */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-emerald-700 bg-emerald-50/80 backdrop-blur-sm rounded-lg border border-emerald-200">
                {success}
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
              {isSubmitting ? "Creating Account..." : "Sign Up"}
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

          {/* Sign In Redirect */}
          <div className="text-sm text-center text-[#4A4A4A]">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="text-[#1A1A1A] font-bold hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}