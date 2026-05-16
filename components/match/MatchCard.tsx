"use client";

import React from "react";
import Link from "next/link";
import { type RecentMatchCard } from "@/lib/validations/models";
import {
  normalizeTeamName,
  shortenTeamNamesInSummary,
} from "@/lib/utils/match";

// ─── Team accent colours ────────────────────────────────────────────────────
const TEAM_COLORS: Record<string, string> = {
  "Mumbai Indians": "#004BA0",
  "Chennai Super Kings": "#C8A800",
  "Royal Challengers Bengaluru": "#CC1020",
  "Kolkata Knight Riders": "#552791",
  "Delhi Capitals": "#0078BC",
  "Sunrisers Hyderabad": "#D4881E",
  "Rajasthan Royals": "#EA1A85",
  "Punjab Kings": "#C41020",
  "Lucknow Super Giants": "#3B82F6",
  "Gujarat Titans": "#1C1C1C",
};

const teamColor = (name: string): string =>
  TEAM_COLORS[normalizeTeamName(name)] ?? "#6B7280";

function TeamTag({ name }: { name: string }) {
  const fullName = normalizeTeamName(name);
  const color = teamColor(fullName);
  return (
    <span className="inline-flex items-center gap-2 text-[0.85rem] font-black font-serif uppercase tracking-tight text-[#2C2B28]">
      <span
        className="shrink-0 inline-block w-2 h-2 border border-[#2C2B28]"
        style={{ background: color }}
        aria-hidden="true"
      />
      <span className="truncate">{fullName}</span>
    </span>
  );
}

export function MatchCard({
  match,
  index,
}: {
  match: RecentMatchCard;
  index: number;
}) {
  const dateLabel = new Date(match.matchDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const roastTeaser =
    match.summary !== null
      ? match.summary.content.length > 160
        ? match.summary.content.slice(0, 157).trimEnd() + "\u2026"
        : match.summary.content
      : null;

  const staggerDelay = `${(index % 10) * 80}ms`;

  // Normalize the score summary to use short names for compactness and uniformity
  const cleanScoreSummary = shortenTeamNamesInSummary(match.scoreSummary);

  const matchYear = new Date(match.matchDate).getFullYear();
  const isHistorical = matchYear < 2026;

  return (
    <article
      className="group relative flex flex-col w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
      style={{ animationDelay: staggerDelay }}
    >
      <Link
        href={isHistorical ? "#" : `/match/${match.externalId}`}
        className={`flex flex-col flex-1 p-6 bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[5px_5px_0_0_rgba(0,0,0,0.2)] transition-all duration-300 ease-out ${
          isHistorical
            ? "cursor-default"
            : "hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[7px_7px_0_0_rgba(0,0,0,0.2)] cursor-pointer"
        } no-underline relative`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
        {/* ─── Blur Overlay for Historical Seasons ─── */}
        {isHistorical && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-[#F9F6EF]/80 backdrop-blur-[2px]">
            <div className="bg-[#9B2C2C] text-[#F9F6EF] px-4 py-2 border-2 border-[#2C2B28] text-[0.65rem] font-mono font-bold uppercase tracking-[0.2em] shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]">
              Roasts Generating...
            </div>
            <p className="mt-4 text-[0.65rem] font-bold font-mono text-[#2C2B28] uppercase tracking-widest text-center bg-[#F9F6EF] px-2 border border-[#2C2B28]">
              Available soon for {matchYear}
            </p>
          </div>
        )}

        {/* ─── HEADER (Teams + Date) ─── */}
        <header className="mb-4 h-[100px] flex flex-col justify-between shrink-0 relative z-10">
          <div className="flex flex-col gap-2">
            <TeamTag name={match.homeTeam} />
            <div className="flex items-center gap-2 pl-4">
              <div className="w-4 h-px bg-[#2C2B28]" />
              <span className="text-[0.55rem] font-mono font-bold tracking-[0.2em] uppercase text-[#6B5E4A]">
                vs
              </span>
            </div>
            <TeamTag name={match.awayTeam} />
          </div>

          <time
            className="block mt-4 text-[0.65rem] font-mono font-bold tracking-[0.18em] uppercase text-[#6B5E4A]"
            dateTime={new Date(match.matchDate).toISOString()}
          >
            {dateLabel}
          </time>
        </header>

        <div className="mb-4 border-b-2 border-dashed border-[#2C2B28] shrink-0 relative z-10" />

        {/* ─── SCORE + VENUE + WINNER ─── */}
        <div className="flex flex-col gap-2.5 mb-5 h-[90px] shrink-0 relative z-10">
          <p className="text-[0.95rem] font-black font-serif tracking-tight leading-snug text-[#2C2B28] line-clamp-2 uppercase">
            {cleanScoreSummary}
          </p>

          <p className="flex items-center gap-1.5 text-[0.68rem] font-mono font-bold text-[#6B5E4A] leading-relaxed shrink-0 uppercase tracking-widest">
            <svg
              className="w-3 h-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z"
              />
              <circle
                cx="12"
                cy="8"
                r="2"
                fill="currentColor"
                strokeWidth={0}
              />
            </svg>
            <span className="truncate">{match.venue}</span>
          </p>

          <div className="h-5 shrink-0 mt-1">
            {match.winner && (
              <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 bg-[#2C2B28] text-[#F9F6EF] text-[0.55rem] font-mono font-bold tracking-widest uppercase">
                WINNER: {normalizeTeamName(match.winner)}
              </div>
            )}
          </div>
        </div>

        {/* ─── ROAST TEASER ─── */}
        <div className="flex-1 mb-6 h-[72px] shrink-0 overflow-hidden relative z-10">
          {roastTeaser ? (
            <blockquote className="relative pl-3 border-l-4 border-[#9B2C2C] h-full">
              <p className="text-[0.8rem] font-serif font-medium leading-relaxed text-[#3A3126] m-0 line-clamp-3">
                {roastTeaser}
              </p>
            </blockquote>
          ) : (
            <div className="flex flex-col justify-center h-full border-l-4 border-[#2C2B28] pl-3">
              <p className="text-[0.65rem] font-mono font-bold text-[#6B5E4A] uppercase tracking-[0.25em]">
                [Awaiting Publisher]
              </p>
            </div>
          )}
        </div>

        {/* ─── FOOTER ─── */}
        <footer className="flex items-center justify-between pt-4 border-t-2 border-[#2C2B28] shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[0.7rem] font-mono font-bold text-[#6B5E4A]">
              🔥 {match.reactionsCount}
            </span>
            <span className="inline-flex items-center gap-1 text-[0.7rem] font-mono font-bold text-[#6B5E4A]">
              💬 {match.commentsCount}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-mono font-bold tracking-widest uppercase text-[#2C2B28] bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:bg-[#2C2B28] group-hover:text-[#F9F6EF] transition-all">
            {isHistorical ? "Archived" : "Read"}
          </div>
        </footer>
      </Link>
    </article>
  );
}
