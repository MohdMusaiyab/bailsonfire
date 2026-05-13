"use client";

import { useState, useEffect } from "react";
import { requestVerificationOTP, verifyEmailOTP } from "@/lib/actions/auth-actions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

interface VerifyEmailFormProps {
  email: string;
  isSessionAuth: boolean;
}

export function VerifyEmailForm({ email, isSessionAuth }: VerifyEmailFormProps) {
  const router = useRouter();
  const { update } = useSession();
  
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // If we arrived from sign-up, the code was already sent once. 
  // We'll default hasSentCode to true so they see the input immediately.
  const [hasSentCode, setHasSentCode] = useState(false);

  // Handle Request/Resend OTP
  const onSendCode = async () => {
    setError(null);
    setSuccess(null);
    setIsSending(true);

    try {
      const result = await requestVerificationOTP(email);
      
      if (result.success) {
        setSuccess(result.message);
        setHasSentCode(true);
        setResendCooldown(60);
      } else {
        setError(result.message);
        if (result.resendAvailableAt) {
          const seconds = Math.ceil((result.resendAvailableAt.getTime() - Date.now()) / 1000);
          setResendCooldown(seconds > 0 ? seconds : 0);
        }
      }
    } catch (err) {
      setError("Failed to send code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Handle OTP Verification
  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsVerifying(true);
    
    try {
      const result = await verifyEmailOTP(otp, email);
      
      if (result.success) {
        setSuccess("Email successfully verified!");
        
        if (isSessionAuth) {
          try {
            await update({});
          } catch (error) {
            console.error("Session update failed:", error);
          }
        }

        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Cooldown Timer Logic
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
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

          <div className="space-y-3 text-center pt-2">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#2C2B28] uppercase leading-[1.1]">
              Verify Email
            </h2>
            <p className="text-[#3A3126] text-sm font-medium border-b border-[#2C2B28]/20 pb-4 inline-block">
              {hasSentCode ? (
                <>
                  Enter the code sent to <br />
                  <span className="text-[#2C2B28] font-bold">{email}</span>
                </>
              ) : (
                <>
                  Ready to roast? Send a code to <br />
                  <span className="text-[#2C2B28] font-bold">{email}</span>
                </>
              )}
            </p>
          </div>

          {!hasSentCode ? (
            <motion.button
              onClick={onSendCode}
              disabled={isSending}
              className="group relative w-full py-4 px-6 bg-[#2C2B28] text-[#F9F6EF] font-mono font-bold text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#5A3A2A] shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {isSending ? "Sending Code..." : "Send Verification Code"}
            </motion.button>
          ) : (
            <form onSubmit={onVerify} className="space-y-5">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center text-3xl tracking-[0.4em] font-mono py-3 bg-[#F9F6EF] border-2 border-[#2C2B28] focus:outline-none focus:ring-0 focus:bg-white transition-colors text-[#2C2B28]"
                  disabled={isVerifying || isSending}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 text-[0.75rem] font-mono uppercase font-bold tracking-wide text-[#F9F6EF] bg-[#9B2C2C] border-2 border-[#2C2B28] text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-[0.75rem] font-mono uppercase font-bold tracking-wide text-[#F9F6EF] bg-[#2C2B28] border-2 border-[#2C2B28] text-center">
                  {success}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isVerifying || isSending || otp.length !== 6}
                className="group relative w-full py-4 px-6 bg-[#2C2B28] text-[#F9F6EF] font-mono font-bold text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#5A3A2A] shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {isVerifying ? "Verifying..." : "Verify Code"}
              </motion.button>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={onSendCode}
                  disabled={isVerifying || isSending || resendCooldown > 0}
                  className="text-[0.65rem] font-mono font-bold uppercase tracking-wider text-[#6B5E4A] hover:text-[#9B2C2C] disabled:text-[#6B5E4A]/50 disabled:cursor-not-allowed transition-colors hover:underline decoration-2 underline-offset-4"
                >
                  {isSending
                    ? "Sending code..."
                    : resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : "Didn't receive a code? Resend"}
                </button>
              </div>
            </form>
          )}

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