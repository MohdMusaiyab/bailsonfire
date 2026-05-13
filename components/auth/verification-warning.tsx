"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export function VerificationWarning() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show if logged in but NOT verified, and NOT on the verification page already
  const showWarning = 
    status === "authenticated" && 
    !session?.user?.emailVerified && 
    !isDismissed &&
    pathname !== "/auth/verify-email";

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-6 right-6 z-[100] w-[320px]"
        >
          <div className="bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[6px_6px_0_0_rgba(0,0,0,0.2)] relative">
            {/* Vintage top double border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#9B2C2C]" />
            <div className="absolute top-2 left-0 w-full h-px bg-[#9B2C2C]" />

            {/* Paper texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
            
            <div className="p-5 pt-6 space-y-4 relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#9B2C2C] flex items-center justify-center border-2 border-[#2C2B28]">
                    <AlertCircle className="w-4 h-4 text-[#F9F6EF]" />
                  </div>
                  <h3 className="text-sm font-black font-serif text-[#2C2B28] uppercase tracking-wide">Verify Email</h3>
                </div>
                
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1 text-[#6B5E4A] hover:text-[#9B2C2C] transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[13px] text-[#3A3126] font-medium leading-relaxed font-serif">
                Please verify your email to unlock commenting and likes on the latest roasts.
              </p>

              <Link
                href="/auth/verify-email"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#2C2B28] text-[#F9F6EF] font-mono font-bold text-[0.65rem] uppercase tracking-[0.2em] shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#5A3A2A] transition-all group"
              >
                Verify Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
