import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ForgotPasswordStep = "EMAIL" | "OTP" | "RESET";

interface ForgotPasswordState {
  email: string;
  otp: string;
  step: ForgotPasswordStep;
  isVerified: boolean;
  timestamp: number | null; // Track when the process started
  lastSentAt: number | null; // Track when the last OTP was sent
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  setStep: (step: ForgotPasswordStep) => void;
  setVerified: (verified: boolean) => void;
  setTimestamp: (time: number | null) => void;
  setLastSentAt: (time: number | null) => void;
  resetMode: () => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>()(
  persist(
    (set) => ({
      email: "",
      otp: "",
      step: "EMAIL",
      isVerified: false,
      timestamp: null,
      lastSentAt: null,
      setEmail: (email) => set({ email }),
      setOtp: (otp) => set({ otp }),
      setStep: (step) => set({ step }),
      setVerified: (verified) => set({ isVerified: verified }),
      setTimestamp: (timestamp) => set({ timestamp }),
      setLastSentAt: (lastSentAt) => set({ lastSentAt }),
      resetMode: () =>
        set({
          email: "",
          otp: "",
          step: "EMAIL",
          isVerified: false,
          timestamp: null,
          lastSentAt: null,
        }),
    }),
    {
      name: "forgot-password-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
