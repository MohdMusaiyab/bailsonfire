"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  requestPasswordResetOTP, 
  verifyPasswordResetOTP, 
  executePasswordReset 
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
    resetMode 
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

  // Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100 m-auto">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          {step === "EMAIL" && "Forgot Password"}
          {step === "OTP" && "Verify Identity"}
          {step === "RESET" && "Set New Password"}
        </h2>
        <p className="text-gray-500 text-sm">
          {step === "EMAIL" && "Enter your email to receive a reset code."}
          {step === "OTP" && `We've sent a code to ${email}`}
          {step === "RESET" && "Choose a strong password for your account."}
        </p>
      </div>

      {/* Step 1: Email Input */}
      {step === "EMAIL" && (
        <form onSubmit={onRequestOTP} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
          <button
            type="submit"
            disabled={isPending || !email}
            className="w-full py-3 px-4 text-white font-semibold bg-gray-900 hover:bg-gray-800 rounded-xl disabled:bg-gray-400 transition-all shadow-md active:scale-[0.98]"
          >
            {isPending ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      )}

      {/* Step 2: OTP Input */}
      {step === "OTP" && (
        <form onSubmit={onVerifyOTP} className="space-y-4">
          <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700 ml-1 block text-center">6-Digit Code</label>
             <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              className="w-full text-center text-3xl tracking-[0.4em] font-mono py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
          {success && <div className="p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-100">{success}</div>}
          
          <button
            type="submit"
            disabled={isPending || otp.length !== 6}
            className="w-full py-3 px-4 text-white font-semibold bg-gray-900 hover:bg-gray-800 rounded-xl disabled:bg-gray-400 transition-all shadow-md active:scale-[0.98]"
          >
            {isPending ? "Verifying..." : "Verify & Continue"}
          </button>

          <div className="text-center">
            <button
              type="button"
              disabled={resendCooldown > 0 || isPending}
              onClick={onRequestOTP}
              className="text-sm font-medium text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : "Didn't get a code? Resend"}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === "RESET" && (
        <form onSubmit={onResetPassword} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
          {success && <div className="p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-100">{success}</div>}
          <button
            type="submit"
            disabled={isPending || !password || password !== confirmPassword}
            className="w-full py-3 px-4 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl disabled:bg-blue-400 transition-all shadow-md active:scale-[0.98]"
          >
            {isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      {/* Footer / Back Link */}
      <div className="pt-4 text-center border-t border-gray-100">
        <button
          onClick={() => {
            resetMode();
            router.push("/auth/sign-in");
          }}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          &larr; Back to Sign In
        </button>
      </div>
    </div>
  );
}
