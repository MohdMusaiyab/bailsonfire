"use client";

import { useTransition, useState, useEffect } from "react";
import { requestVerificationOTP, verifyEmailOTP } from "@/lib/actions/auth-actions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
    
   // In verify-email-form.tsx, inside the onVerify function after successful verification:

if (result.success) {
  console.log("[VERIFY FORM] OTP verification SUCCESS on server!");
  setSuccess("Email successfully verified!");
  
  // IMPORTANT: Log session before update
  console.log("[VERIFY FORM] Session BEFORE update call:", JSON.stringify(session, null, 2));
  console.log("[VERIFY FORM] Calling update() to refresh session...");
  
  try {
    // Pass an empty object to force the update trigger
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
}
  };

  // Cooldown Timer Logic
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border m-auto border-gray-100">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Verify Your Email</h2>
        <p className="text-gray-500 text-sm">
          {hasSentCode 
            ? `We've sent a verification code to ${email}`
            : `Click the button below to receive a verification code at ${email}`
          }
        </p>
      </div>

      {!hasSentCode ? (
        <div className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">{error}</div>}
          <button
            onClick={onSendCode}
            disabled={isPending || resendCooldown > 0}
            className="w-full py-2.5 px-4 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-blue-400 transition-colors shadow-sm"
          >
            {isPending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Send Verification Code"}
          </button>
        </div>
      ) : (
        <form onSubmit={onVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Enter 6-digit Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900"
              disabled={isPending}
              required
              autoFocus
            />
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">{error}</div>}
          {success && <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-100">{success}</div>}

          <button
            type="submit"
            disabled={isPending || otp.length !== 6}
            className="w-full py-2.5 px-4 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-blue-400 transition-colors shadow-sm"
          >
            {isPending ? "Verifying..." : "Verify Code"}
          </button>

          <div className="flex flex-col items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onSendCode}
              disabled={isPending || resendCooldown > 0}
              className="text-xs font-medium text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : "Didn't receive a code? Resend"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}