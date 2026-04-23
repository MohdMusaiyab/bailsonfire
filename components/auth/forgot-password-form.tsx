"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  executePasswordReset,
} from "@/lib/actions/auth-actions";
import { useForgotPasswordStore } from "@/hooks/use-forgot-password-store";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Zustand Store
  const {
    email,
    otp,
    step,
    isVerified,
    setEmail,
    setOtp,
    setStep,
    setVerified,
    timestamp,
    setTimestamp,
    resetMode,
  } = useForgotPasswordStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Request OTP
  const onRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await requestPasswordResetOTP(email);
      if (result.success) {
        setSuccess(result.message);
        setStep("OTP");
        setTimestamp(Date.now()); // Start the 10-minute timer
        setResendCooldown(60);
      } else {
        setError(result.message);
      }
    });
  };

  // Step 2: Verify OTP
  const onVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await verifyPasswordResetOTP(email, otp);
      if (result.success) {
        setSuccess(result.message);
        setVerified(true);
        setStep("RESET");
      } else {
        setError(result.message);
      }
    });
  };

  // Step 3: Execute Reset
  const onResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await executePasswordReset(email, otp, password);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          resetMode();
          router.push("/auth/sign-in");
        }, 2000);
      } else {
        setError(result.message);
      }
    });
  };

  // Auto-clear stale state (older than 10 mins) on mount
  useEffect(() => {
    if (timestamp) {
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - timestamp > tenMinutes) {
        resetMode();
      }
    }
  }, [timestamp, resetMode]);

  // Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(
      () => setResendCooldown((prev) => prev - 1),
      1000,
    );
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FCFBF7] px-4 py-12">
      {/* Subtle floating background orbs (consistent theme) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute rounded-full bg-[#1A1A1A]/5 blur-3xl"
          style={{ width: "400px", height: "400px", left: "-10%", top: "20%" }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full bg-[#1A1A1A]/5 blur-3xl"
          style={{
            width: "500px",
            height: "500px",
            right: "-15%",
            bottom: "10%",
          }}
          animate={{ x: [0, -40, 0], y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full bg-emerald-500/5 blur-3xl"
          style={{
            width: "300px",
            height: "300px",
            left: "20%",
            bottom: "30%",
          }}
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
              {step === "EMAIL" && "Forgot Password"}
              {step === "OTP" && "Verify Identity"}
              {step === "RESET" && "Set New Password"}
            </h2>
            <p className="text-[#4A4A4A] text-sm font-medium">
              {step === "EMAIL" && "Enter your email to receive a reset code."}
              {step === "OTP" && (
                <>
                  We{"\u2019"}ve sent a code to{" "}
                  <span className="font-bold text-[#1A1A1A]">{email}</span>.{" "}
                  <button
                    onClick={() => {
                      setStep("EMAIL");
                      setOtp("");
                    }}
                    className="text-[#1A1A1A] font-bold hover:underline ml-1"
                  >
                    Edit
                  </button>
                </>
              )}
              {step === "RESET" && "Choose a strong password for your account."}
            </p>
          </div>

          {/* Step 1: Email Input */}
          {step === "EMAIL" && (
            <form onSubmit={onRequestOTP} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#1A1A1A] ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-[#1A1A1A]/20 rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] outline-none transition-all text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <motion.button
                type="submit"
                disabled={isPending || !email}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 text-white font-bold rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1A1A1A]/20"
              >
                {isPending ? "Sending..." : "Send Reset Code"}
              </motion.button>
            </form>
          )}

          {/* Step 2: OTP Input */}
          {step === "OTP" && (
            <form onSubmit={onVerifyOTP} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#1A1A1A] ml-1 block text-center">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  className="w-full text-center text-3xl tracking-[0.4em] font-mono py-3 bg-white border border-[#1A1A1A]/20 rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] outline-none transition-all text-[#1A1A1A]"
                />
              </div>
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
              <motion.button
                type="submit"
                disabled={isPending || otp.length !== 6}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 text-white font-bold rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1A1A1A]/20"
              >
                {isPending ? "Verifying..." : "Verify & Continue"}
              </motion.button>

              <div className="text-center">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isPending}
                  onClick={onRequestOTP}
                  className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#1A1A1A] disabled:text-[#1A1A1A]/30 disabled:cursor-not-allowed transition-colors"
                >
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : "Didn't get a code? Resend"}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "RESET" && (
            <form onSubmit={onResetPassword} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#1A1A1A] ml-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-[#1A1A1A]/20 rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] outline-none transition-all text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#1A1A1A] ml-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-[#1A1A1A]/20 rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] outline-none transition-all text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                  />
                </div>
              </div>
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
              <motion.button
                type="submit"
                disabled={
                  isPending || !password || password !== confirmPassword
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 text-white font-bold rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1A1A1A]/20"
              >
                {isPending ? "Updating..." : "Update Password"}
              </motion.button>
            </form>
          )}

          {/* Footer Navigation - Back to Home Page only */}
          <div className="flex justify-center pt-2 border-t border-[#1A1A1A]/5">
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
