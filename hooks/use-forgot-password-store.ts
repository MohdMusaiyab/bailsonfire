import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ForgotPasswordStep = "EMAIL" | "OTP" | "RESET";

interface ForgotPasswordState {
  email: string;
  otp: string;
  step: ForgotPasswordStep;
  isVerified: boolean;
  timestamp: number | null; // Track when the process started
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  setStep: (step: ForgotPasswordStep) => void;
  setVerified: (verified: boolean) => void;
  setTimestamp: (time: number | null) => void;
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
      setEmail: (email) => set({ email }),
      setOtp: (otp) => set({ otp }),
      setStep: (step) => set({ step }),
      setVerified: (verified) => set({ isVerified: verified }),
      setTimestamp: (timestamp) => set({ timestamp }),
      resetMode: () =>
        set({
          email: "",
          otp: "",
          step: "EMAIL",
          isVerified: false,
          timestamp: null,
        }),
    }),
    {
      name: "forgot-password-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
