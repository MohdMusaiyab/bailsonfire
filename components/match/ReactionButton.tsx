"use client";

/**
 * ReactionButton.tsx — Client Component
 *
 * Replaces the simple Like button with a multi-reaction selector (FIRE, LOVE, AVERAGE, TRASH).
 * Uses optimistic UI updates for immediate feedback.
 */

import React, { useState, useTransition } from "react";
import toggleReaction from "@/lib/actions/interactions";
import { ReactionType } from "@/lib/validations/models";

interface Props {
  matchId: string;
  initialCount: number;
  initialReaction: ReactionType | null;
  isAuthenticated: boolean;
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
}: Props) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(
    initialReaction,
  );
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  async function handleReaction(type: ReactionType) {
    if (!isAuthenticated || isPending) return;

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
      // If switching, count remains same as total reactions is what we display
    }

    startTransition(async () => {
      const result = await toggleReaction(matchId, type);
      if ("error" in result) {
        // Rollback on error
        setUserReaction(prevReaction);
        setCount(prevCount);
      } else {
        setCount(result.newCount);
        setUserReaction(result.newType);
      }
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="relative group/reaction">
        <div className="flex items-center gap-1.5 p-1.5 bg-white border border-[#1A1A1A]/6 rounded-2xl shadow-sm">
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              disabled
              className="w-9 h-9 flex items-center justify-center rounded-xl text-lg grayscale opacity-30 cursor-not-allowed"
            >
              {r.emoji}
            </button>
          ))}
          <div className="h-4 w-px bg-[#1A1A1A]/10 mx-1" />
          <span className="pr-3 pl-1 text-[0.75rem] font-black text-[#1A1A1A]/30">
            {count}
          </span>
        </div>
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1A1A1A] text-[#FCFBF7] text-[0.68rem] font-semibold px-3 py-1.5 opacity-0 group-hover/reaction:opacity-100 transition-opacity duration-150">
          Sign in to react
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-white border border-[#1A1A1A]/10 rounded-2xl shadow-sm">
      {REACTIONS.map((r) => {
        const isActive = userReaction === r.type;
        return (
          <button
            key={r.type}
            onClick={() => handleReaction(r.type)}
            disabled={isPending}
            title={r.label}
            className={`
              relative w-10 h-10 flex items-center justify-center rounded-xl text-xl 
              transition-all duration-200 hover:scale-110 active:scale-95
              ${
                isActive
                  ? "bg-[#1A1A1A]/5 ring-2 ring-[#1A1A1A]/10"
                  : "hover:bg-[#1A1A1A]/4"
              }
              ${!isActive && userReaction !== null ? "grayscale-[0.5] opacity-60" : ""}
              ${isPending ? "cursor-wait" : ""}
            `}
          >
            {r.emoji}
            {isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1A1A1A]" />
            )}
          </button>
        );
      })}

      <div className="h-5 w-px bg-[#1A1A1A]/10 mx-1.5" />

      <span className="pr-3 pl-1 text-[0.8rem] font-black text-[#1A1A1A]/80 tabular-nums">
        {count}
      </span>
    </div>
  );
}
