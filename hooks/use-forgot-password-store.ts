import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ForgotPasswordStep = "EMAIL" | "OTP" | "RESET";

interface ForgotPasswordState {
  email: string;
  otp: string;
  step: ForgotPasswordStep;
  isVerified: boolean;
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  setStep: (step: ForgotPasswordStep) => void;
  setVerified: (verified: boolean) => void;
  resetMode: () => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>()(
  persist(
    (set) => ({
      email: "",
      otp: "",
      step: "EMAIL",
      isVerified: false,
      setEmail: (email) => set({ email }),
      setOtp: (otp) => set({ otp }),
      setStep: (step) => set({ step }),
      setVerified: (verified) => set({ isVerified: verified }),
      resetMode: () =>
        set({
          email: "",
          otp: "",
          step: "EMAIL",
          isVerified: false,
        }),
    }),
    {
      name: "forgot-password-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
