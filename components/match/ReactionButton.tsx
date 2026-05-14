"use client";

/**
 * ReactionButton.tsx — Client Component
 *
 * Replaces the simple Like button with a multi-reaction selector (FIRE, LOVE, AVERAGE, TRASH).
 * Uses optimistic UI updates for immediate feedback.
 * 
 * UPDATED: Added isVerified check and specific tooltips for unverified users.
 */

import React, { useState, useTransition } from "react";
import toggleReaction from "@/lib/actions/interactions";
import { ReactionType } from "@/lib/validations/models";

interface Props {
  matchId: string;
  initialCount: number;
  initialReaction: ReactionType | null;
  isAuthenticated: boolean;
  isVerified: boolean;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "FIRE", emoji: "🔥", label: "Fire" },
  { type: "LOVE", emoji: "❤️", label: "Loved It" },
  { type: "AVERAGE", emoji: "😐", label: "Average" },
  { type: "TRASH", emoji: "🗑️", label: "Trash" },
];

export function ReactionButton({
  matchId,
  initialCount,
  initialReaction,
  isAuthenticated,
  isVerified,
}: Props) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(
    initialReaction,
  );
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  async function handleReaction(type: ReactionType) {
    if (!isAuthenticated || !isVerified || isPending) return;

    // Optimistic Update
    const prevReaction = userReaction;
    const prevCount = count;

    if (userReaction === type) {
      // Toggle off
      setUserReaction(null);
      setCount((c) => Math.max(0, c - 1));
    } else {
      // Switch or New
      setUserReaction(type);
      if (!prevReaction) {
        setCount((c) => c + 1);
      }
    }

    startTransition(async () => {
      const result = await toggleReaction(matchId, type);
      if ("error" in result) {
        // Rollback on error
        setUserReaction(prevReaction);
        setCount(prevCount);
        
        if (result.error === "email_unverified") {
          alert("Please verify your email to react to roasts.");
        }
      } else {
        setCount(result.newCount);
        setUserReaction(result.newType);
      }
    });
  }

  // Handle Unauthorized or Unverified States
  if (!isAuthenticated || !isVerified) {
    const message = !isAuthenticated 
      ? "Sign in to react" 
      : "Verify email to react";

    return (
      <div className="relative group/reaction">
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[3px_3px_0_0_rgba(0,0,0,0.2)]">
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              disabled
              className="w-9 h-9 flex items-center justify-center text-lg grayscale opacity-30 cursor-not-allowed border-2 border-transparent"
            >
              {r.emoji}
            </button>
          ))}
          <div className="h-5 w-px bg-[#2C2B28] mx-1" />
          <span className="pr-3 pl-1 text-[0.8rem] font-mono font-bold text-[#6B5E4A]">
            {count}
          </span>
        </div>
        <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#2C2B28] text-[#F9F6EF] text-[0.65rem] font-mono font-bold uppercase tracking-widest px-3 py-1.5 opacity-0 group-hover/reaction:opacity-100 transition-opacity duration-150 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]">
          {message}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[3px_3px_0_0_rgba(0,0,0,0.2)]">
      {REACTIONS.map((r) => {
        const isActive = userReaction === r.type;
        return (
          <button
            key={r.type}
            onClick={() => handleReaction(r.type)}
            disabled={isPending}
            title={r.label}
            className={`
              relative w-10 h-10 flex items-center justify-center text-xl border-2
              transition-all duration-100 hover:scale-105 active:scale-95
              ${
                isActive
                  ? "border-[#2C2B28] bg-[#2C2B28]/10 shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.2)] translate-y-px translate-x-px"
                  : "border-transparent hover:border-[#2C2B28]"
              }
              ${!isActive && userReaction !== null ? "grayscale-[0.5] opacity-60" : ""}
              ${isPending ? "cursor-wait" : ""}
            `}
          >
            {r.emoji}
          </button>
        );
      })}

      <div className="h-6 w-px bg-[#2C2B28] mx-1.5" />

      <span className="pr-3 pl-1 text-[0.8rem] font-mono font-bold text-[#2C2B28] tabular-nums">
        {count}
      </span>
    </div>
  );
}
