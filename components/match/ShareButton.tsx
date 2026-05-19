"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  title: string;
  text: string;
  url: string;
  externalId: string;
}

export function ShareButton({ title, text, url, externalId }: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    // 1. Try Web Share API (First try files sharing, then text sharing)
    if (navigator.share) {
      try {
        const response = await fetch(`/api/match-card/${externalId}`);
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], `bailsonfire-${externalId}.png`, { type: "image/png" });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title,
              text,
              files: [file],
            });
            setSharing(false);
            return;
          }
        }
      } catch (err) {
        console.log("File sharing failed/cancelled, falling back to text...", err);
      }

      // Text share fallback
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        setSharing(false);
        return;
      } catch (err) {
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
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(`/api/match-card/${externalId}`);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `bailsonfire-roast-${externalId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download roast card:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3.5 relative">
      {/* Share Button */}
      <div className="relative">
        <motion.button
          onClick={handleShare}
          disabled={sharing || downloading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#2C2B28] text-[#F9F6EF] border-2 border-[#2C2B28] text-[0.75rem] font-mono font-bold uppercase tracking-widest shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] transition-all hover:shadow-[1px_1px_0_0_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none"
        >
          {sharing ? (
            <svg className="animate-spin h-4 w-4 text-[#F9F6EF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
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
          )}
          {sharing ? "Sharing..." : "Share Roast"}
        </motion.button>

        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute left-1/2 -translate-x-1/2 -top-12 px-3 py-1.5 bg-[#F9F6EF] text-[#2C2B28] border-2 border-[#2C2B28] text-[0.65rem] font-mono font-bold uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] whitespace-nowrap z-50"
            >
              Link Copied!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Download Card Button */}
      <motion.button
        onClick={handleDownload}
        disabled={sharing || downloading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#F9F6EF] text-[#2C2B28] border-2 border-[#2C2B28] text-[0.75rem] font-mono font-bold uppercase tracking-widest shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] transition-all hover:shadow-[1px_1px_0_0_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none"
      >
        {downloading ? (
          <svg className="animate-spin h-4 w-4 text-[#2C2B28]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )}
        {downloading ? "Downloading..." : "Download Card"}
      </motion.button>
    </div>
  );
}
