"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  title: string;
  text: string;
  url: string;
}

export function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // 1. Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or error, fall back to copy
        console.log("Share failed or cancelled", err);
      }
    }

    // 2. Fallback to Clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleShare}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#1A1A1A] text-[#FCFBF7] rounded-xl text-sm font-bold transition-all hover:bg-[#1A1A1A]/90 shadow-sm"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share Roast
      </motion.button>

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute left-1/2 -translate-x-1/2 -top-12 px-3 py-1.5 bg-emerald-600 text-white text-[0.7rem] font-bold rounded-lg shadow-lg whitespace-nowrap z-50"
          >
            Link Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
