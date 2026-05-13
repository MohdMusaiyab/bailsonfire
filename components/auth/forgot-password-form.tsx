"use client";

import { useState, useEffect } from "react";
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
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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
    lastSentAt,
    setLastSentAt,
    resetMode,
  } = useForgotPasswordStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Request OTP
  const onRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSending(true);

    try {
      const result = await requestPasswordResetOTP(email);
      if (result.success) {
        setSuccess(result.message);
        setStep("OTP");
        setTimestamp(Date.now());
        setLastSentAt(Date.now());
        setResendCooldown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to send code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Step 2: Verify OTP
  const onVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsVerifying(true);

    try {
      const result = await verifyPasswordResetOTP(email, otp);
      if (result.success) {
        setSuccess(result.message);
        setVerified(true);
        setStep("RESET");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 3: Execute Reset
  const onResetPassword = async (e: React.FormEvent) => {
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
    setIsResetting(true);

    try {
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
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  // Auto-clear stale state (older than 10 mins) and sync cooldown on mount
  useEffect(() => {
    if (timestamp) {
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - timestamp > tenMinutes) {
        resetMode();
      }
    }

    // Sync cooldown from persisted lastSentAt
    if (lastSentAt) {
      const secondsPassed = Math.floor((Date.now() - lastSentAt) / 1000);
      if (secondsPassed < 60) {
        setResendCooldown(60 - secondsPassed);
      }
    }
  }, [timestamp, lastSentAt, resetMode]);

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
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#2C2B28] uppercase leading-[1.1]">
              {step === "EMAIL" && "Forgot Password"}
              {step === "OTP" && "Verify Identity"}
              {step === "RESET" && "Set New Password"}
            </h2>
            <p className="text-[#3A3126] text-sm font-medium border-b border-[#2C2B28]/20 pb-4 inline-block">
              {step === "EMAIL" && "Enter your email to receive a reset code."}
              {step === "OTP" && (
                <>
                  We&apos;ve sent a code to{" "}
                  <span className="font-bold text-[#2C2B28]">{email}</span>.{" "}
                  <button
                    onClick={() => {
                      setStep("EMAIL");
                      setOtp("");
                    }}
                    className="text-[#9B2C2C] font-bold hover:text-[#2C2B28] hover:underline transition-colors ml-1"
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
            <form onSubmit={onRequestOTP} className="space-y-5">
              <div>
                <label className="block text-[0.7rem] font-mono font-bold uppercase tracking-wider text-[#2C2B28] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-3 bg-[#F9F6EF] border-2 border-[#2C2B28] focus:outline-none focus:ring-0 focus:bg-white transition-colors text-[#2C2B28] font-serif placeholder:font-serif placeholder:italic placeholder:text-[#6B5E4A]/50"
                />
              </div>
              {error && (
                <div className="p-3 text-[0.75rem] font-mono uppercase font-bold tracking-wide text-[#F9F6EF] bg-[#9B2C2C] border-2 border-[#2C2B28]">
                  {error}
                </div>
              )}
              <motion.button
                type="submit"
                disabled={isSending || !email}
                className="group relative w-full py-4 px-6 bg-[#2C2B28] text-[#F9F6EF] font-mono font-bold text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#5A3A2A] shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {isSending ? "Sending..." : "Send Reset Code"}
              </motion.button>
            </form>
          )}

          {/* Step 2: OTP Input */}
          {step === "OTP" && (
            <form onSubmit={onVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-[0.7rem] font-mono font-bold uppercase tracking-wider text-[#2C2B28] mb-2 text-center">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  required
                  className="w-full text-center text-3xl tracking-[0.4em] font-mono py-3 bg-[#F9F6EF] border-2 border-[#2C2B28] focus:outline-none focus:ring-0 focus:bg-white transition-colors text-[#2C2B28]"
                />
              </div>
              {error && (
                <div className="p-3 text-[0.75rem] font-mono uppercase font-bold tracking-wide text-[#F9F6EF] bg-[#9B2C2C] border-2 border-[#2C2B28]">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-[0.75rem] font-mono uppercase font-bold tracking-wide text-[#F9F6EF] bg-[#2C2B28] border-2 border-[#2C2B28]">
                  {success}
                </div>
              )}
              <motion.button
                type="submit"
                disabled={isVerifying || otp.length !== 6}
                className="group relative w-full py-4 px-6 bg-[#2C2B28] text-[#F9F6EF] font-mono font-bold text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#5A3A2A] shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </motion.button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSending}
                  onClick={onRequestOTP}
                  className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[#6B5E4A] hover:text-[#9B2C2C] disabled:text-[#6B5E4A]/50 disabled:cursor-not-allowed transition-colors hover:underline decoration-2 underline-offset-4"
                >
                  {isSending
                    ? "Sending..."
                    : resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : "Didn't get a code? Resend"}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "RESET" && (
            <form onSubmit={onResetPassword} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[0.7rem] font-mono font-bold uppercase tracking-wider text-[#2C2B28] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-[#F9F6EF] border-2 border-[#2C2B28] focus:outline-none focus:ring-0 focus:bg-white transition-colors text-[#2C2B28] font-serif placeholder:font-serif placeholder:italic placeholder:text-[#6B5E4A]/50"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-mono font-bold uppercase tracking-wider text-[#2C2B28] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-[#F9F6EF] border-2 border-[#2C2B28] focus:outline-none focus:ring-0 focus:bg-white transition-colors text-[#2C2B28] font-serif placeholder:font-serif placeholder:italic placeholder:text-[#6B5E4A]/50"
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 text-[0.75rem] font-mono uppercase font-bold tracking-wide text-[#F9F6EF] bg-[#9B2C2C] border-2 border-[#2C2B28]">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-[0.75rem] font-mono uppercase font-bold tracking-wide text-[#F9F6EF] bg-[#2C2B28] border-2 border-[#2C2B28]">
                  {success}
                </div>
              )}
              <motion.button
                type="submit"
                disabled={
                  isResetting || !password || password !== confirmPassword
                }
                className="group relative w-full py-4 px-6 bg-[#2C2B28] text-[#F9F6EF] font-mono font-bold text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#5A3A2A] shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {isResetting ? "Updating..." : "Update Password"}
              </motion.button>
            </form>
          )}

          {/* Footer Navigation - Back to Home Page only */}
          <div className="flex justify-center pt-6 border-t border-[#2C2B28]/20">
            <Link
              href="/"
              className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[#6B5E4A] hover:text-[#2C2B28] transition-colors hover:underline decoration-2 underline-offset-4"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
