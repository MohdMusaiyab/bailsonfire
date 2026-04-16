'use client';

/**
 * LikeButton.tsx — Client Component
 *
 * Shows the total like count and a Like/Unlike button.
 * For GUESTS: visible but disabled with a "Sign in to like" tooltip.
 * For LOGGED-IN: interactive with optimistic state update.
 */

import React, { useState, useTransition } from 'react';
import { toggleLike } from '@/lib/actions/interactions';

interface Props {
  matchId: string;
  initialCount: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
}

export function LikeButton({ matchId, initialCount, initialLiked, isAuthenticated }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) return; // belt-and-suspenders — button is disabled anyway

    // Optimistic update — flip immediately, server confirms
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => (nextLiked ? c + 1 : c - 1));

    startTransition(async () => {
      const result = await toggleLike(matchId);
      // If server disagreed (race condition, error), revert
      if ('error' in result) {
        setLiked(liked);
        setCount(count);
      } else {
        // Sync to server's authoritative count
        setCount(result.newCount);
        setLiked(result.liked);
      }
    });
  }

  // Shared visual classes
  const baseClass =
    'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider border transition-all duration-200';

  if (!isAuthenticated) {
    return (
      <div className="relative group/like">
        <button
          disabled
          aria-label="Sign in to like this roast"
          className={`${baseClass} bg-[#FCFBF7] border-[#1A1A1A]/10 text-[#1A1A1A]/30 cursor-not-allowed select-none`}
        >
          <HeartIcon filled={false} />
          <span>{count}</span>
        </button>
        {/* Tooltip for guests */}
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1A1A1A] text-[#FCFBF7] text-[0.68rem] font-semibold px-3 py-1.5 opacity-0 group-hover/like:opacity-100 transition-opacity duration-150">
          Sign in to like
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={liked ? 'Unlike this roast' : 'Like this roast'}
      aria-pressed={liked}
      className={`${baseClass} ${
        liked
          ? 'bg-[#1A1A1A] text-[#FCFBF7] border-[#1A1A1A]'
          : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/12 hover:border-[#1A1A1A]/30 hover:bg-[#1A1A1A]/4'
      } ${isPending ? 'opacity-60' : ''}`}
    >
      <HeartIcon filled={liked} />
      <span>{count}</span>
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}
