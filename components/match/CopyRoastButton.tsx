'use client';

import { useState } from 'react';

interface CopyRoastButtonProps {
  roastText: string;
}

export function CopyRoastButton({ roastText }: CopyRoastButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roastText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy roast to clipboard:', err);
    }
  };

  return (
    <div className="flex justify-end mt-4">
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 px-3 py-1.5 border-2 border-[#2C2B28] text-[0.68rem] font-mono font-bold uppercase tracking-widest transition-all duration-150 active:translate-y-0.5 active:translate-x-0.5 active:shadow-none shadow-[2.5px_2.5px_0_0_rgba(0,0,0,0.2)] ${
          copied
            ? 'bg-[#2C2B28] text-[#F9F6EF]'
            : 'bg-[#F9F6EF] text-[#2C2B28] hover:bg-[#2C2B28] hover:text-[#F9F6EF]'
        }`}
        aria-label="Copy roast text to clipboard"
      >
        {copied ? (
          <>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            <span>Copy Roast</span>
          </>
        )}
      </button>
    </div>
  );
}
