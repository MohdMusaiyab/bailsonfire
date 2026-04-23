"use client";

import { useTransition, useState, useEffect } from "react";
import { requestVerificationOTP, verifyEmailOTP } from "@/lib/actions/auth-actions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

interface VerifyEmailFormProps {
  email: string;
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  console.log("[VERIFY FORM] Component mounted with email:", email);
  
  const router = useRouter();
  const { data: session, update } = useSession();
  
  console.log("[VERIFY FORM] Initial session from useSession:", JSON.stringify(session, null, 2));
  console.log("[VERIFY FORM] Initial session emailVerified:", session?.user?.emailVerified);
  
  const [isPending, startTransition] = useTransition();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasSentCode, setHasSentCode] = useState(false);

  // Handle Request/Resend OTP
  const onSendCode = () => {
    console.log("[VERIFY FORM] onSendCode triggered");
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      console.log("[VERIFY FORM] Calling requestVerificationOTP...");
      const result = await requestVerificationOTP();
      console.log("[VERIFY FORM] requestVerificationOTP result:", result);
      
      if (result.success) {
        setSuccess(result.message);
        setHasSentCode(true);
        setResendCooldown(60);
        console.log("[VERIFY FORM] OTP sent successfully, cooldown started");
      } else {
        setError(result.message);
        if (result.resendAvailableAt) {
          const seconds = Math.ceil((result.resendAvailableAt.getTime() - Date.now()) / 1000);
          setResendCooldown(seconds > 0 ? seconds : 0);
          console.log("[VERIFY FORM] Resend cooldown set to:", seconds);
        }
      }
    });
  };

  // Handle OTP Verification
  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[VERIFY FORM] onVerify triggered, OTP length:", otp.length);
    
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      console.log("[VERIFY FORM] Invalid OTP length");
      return;
    }

    setError(null);
    setSuccess(null);
    
    console.log("[VERIFY FORM] Calling verifyEmailOTP with OTP:", otp);
    const result = await verifyEmailOTP(otp);
    console.log("[VERIFY FORM] verifyEmailOTP result:", result);
    
    if (result.success) {
      console.log("[VERIFY FORM] OTP verification SUCCESS on server!");
      setSuccess("Email successfully verified!");
      
      console.log("[VERIFY FORM] Session BEFORE update call:", JSON.stringify(session, null, 2));
      console.log("[VERIFY FORM] Calling update() to refresh session...");
      
      try {
        const updatedSession = await update({});
        console.log("[VERIFY FORM] update() completed successfully");
        console.log("[VERIFY FORM] Updated session returned:", JSON.stringify(updatedSession, null, 2));
        console.log("[VERIFY FORM] Updated session emailVerified:", updatedSession?.user?.emailVerified);
      } catch (error) {
        console.error("[VERIFY FORM] update() FAILED with error:", error);
      }

      console.log("[VERIFY FORM] Waiting 1.5 seconds before redirect...");
      setTimeout(() => {
        console.log("[VERIFY FORM] Redirecting to home page with hard navigation");
        window.location.href = "/";
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  // Cooldown Timer Logic
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
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
              Verify Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#1A1A1A]/50">
                Email
              </span>
            </h2>
            <p className="text-[#4A4A4A] text-sm font-medium">
              {hasSentCode 
                ? `We{"\u2019"}ve sent a verification code to ${email}`
                : `Click below to receive a code at ${email}`
              }
            </p>
          </div>

          {!hasSentCode ? (
            <div className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <motion.button
                onClick={onSendCode}
                disabled={isPending || resendCooldown > 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 text-white font-bold rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1A1A1A]/20"
              >
                {isPending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Send Verification Code"}
              </motion.button>
            </div>
          ) : (
            <form onSubmit={onVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2 text-center">
                  Enter 6-digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 bg-white border border-[#1A1A1A]/20 rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] outline-none transition-all text-[#1A1A1A]"
                  disabled={isPending}
                  required
                  autoFocus
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
                {isPending ? "Verifying..." : "Verify Code"}
              </motion.button>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={onSendCode}
                  disabled={isPending || resendCooldown > 0}
                  className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors disabled:text-[#1A1A1A]/30 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : "Didn't receive a code? Resend"}
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-col items-center gap-3 pt-2 border-t border-[#1A1A1A]/5">
            <Link
              href="/matches/2026"
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
              Back to Matches
            </Link>

            <Link
              href="/auth/sign-up"
              className="text-xs text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors font-medium"
            >
              Entered the wrong email? Sign up again
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}