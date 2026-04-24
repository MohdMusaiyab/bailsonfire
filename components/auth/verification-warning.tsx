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
          <div className="bg-white/80 backdrop-blur-xl border border-[#1A1A1A]/10 shadow-2xl shadow-[#1A1A1A]/10 rounded-2xl overflow-hidden">
            {/* Top accent line */}
            <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-red-500 to-purple-600" />
            
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">Verify Email</h3>
                </div>
                
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1 text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[13px] text-[#1A1A1A]/60 font-medium leading-relaxed">
                Please verify your email to unlock commenting and likes on the latest roasts.
              </p>

              <Link
                href="/auth/verify-email"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-[#FCFBF7] text-[13px] font-bold rounded-xl hover:bg-[#2A2A2A] transition-all active:scale-[0.98] group"
              >
                Verify Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
