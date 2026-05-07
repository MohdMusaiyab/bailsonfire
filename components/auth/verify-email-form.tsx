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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#1A1A1A]/10 p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-black tracking-tight text-[#1A1A1A]">
              Verify Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#1A1A1A]/50">
                Email
              </span>
            </h2>
            <p className="text-[#4A4A4A] text-sm font-medium">
              {hasSentCode ? (
                <>
                  Enter the code sent to <br />
                  <span className="text-[#1A1A1A] font-bold">{email}</span>
                </>
              ) : (
                <>
                  Ready to roast? Send a code to <br />
                  <span className="text-[#1A1A1A] font-bold">{email}</span>
                </>
              )}
            </p>
          </div>

          {!hasSentCode ? (
            <motion.button
              onClick={onSendCode}
              disabled={isSending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-4 text-white font-bold rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1A1A1A]/20"
            >
              {isSending ? "Sending Code..." : "Send Verification Code"}
            </motion.button>
          ) : (
            <form onSubmit={onVerify} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center text-3xl tracking-[0.4em] font-mono py-4 bg-white border border-[#1A1A1A]/20 rounded-xl focus:ring-2 focus:ring-[#1A1A1A]/30 focus:border-[#1A1A1A] outline-none transition-all text-[#1A1A1A]"
                  disabled={isVerifying || isSending}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200 text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm text-emerald-700 bg-emerald-50/80 backdrop-blur-sm rounded-lg border border-emerald-200 text-center">
                  {success}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isVerifying || isSending || otp.length !== 6}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 px-4 text-white font-bold rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1A1A1A]/20"
              >
                {isVerifying ? "Verifying..." : "Verify Code"}
              </motion.button>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={onSendCode}
                  disabled={isVerifying || isSending || resendCooldown > 0}
                  className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors disabled:text-[#1A1A1A]/30 disabled:cursor-not-allowed"
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

          <div className="flex flex-col items-center gap-3 pt-2 border-t border-[#1A1A1A]/5">
             <Link
              href="/"
              className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors font-medium"
            >
              Back to Home Page
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}