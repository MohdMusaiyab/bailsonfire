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
    <span className="inline-flex items-center gap-2 text-[0.85rem] font-black tracking-tight text-[#1A1A1A]">
      <span
        className="shrink-0 inline-block w-1.5 h-1.5 rounded-full"
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
  const dateLabel = match.matchDate.toLocaleDateString("en-IN", {
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

  const matchYear = match.matchDate.getFullYear();
  const isHistorical = matchYear < 2026;

  return (
    <article
      className="group relative flex flex-col w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
      style={{ animationDelay: staggerDelay }}
    >
      <Link
        href={isHistorical ? "#" : `/match/${match.externalId}`}
        className={`flex flex-col flex-1 p-6 bg-white border border-[#1A1A1A]/[0.06] rounded-2xl shadow-sm transition-all duration-300 ease-out ${
          isHistorical
            ? "cursor-default"
            : "group-hover:-translate-y-1.5 group-hover:shadow-md cursor-pointer"
        } no-underline overflow-hidden relative`}
      >
        {/* ─── Blur Overlay for Historical Seasons ─── */}
        {isHistorical && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-[#FCFBF7]/40 backdrop-blur-[3px]">
            <div className="bg-[#1A1A1A] text-[#FCFBF7] px-4 py-2 rounded-full text-[0.6rem] font-black uppercase tracking-[0.2em] shadow-xl">
              Roasts Generating...
            </div>
            <p className="mt-3 text-[0.65rem] font-bold text-[#1A1A1A]/40 uppercase tracking-widest text-center">
              Available soon for {matchYear}
            </p>
          </div>
        )}

        {/* ─── HEADER (Teams + Date) ─── */}
        <header className="mb-4 h-[100px] flex flex-col justify-between shrink-0">
          <div className="flex flex-col gap-2">
            <TeamTag name={match.homeTeam} />
            <div className="flex items-center gap-2 pl-4">
              <div className="w-4 h-px bg-[#1A1A1A]/10" />
              <span className="text-[0.55rem] font-black tracking-[0.2em] uppercase text-[#1A1A1A]/30">
                vs
              </span>
            </div>
            <TeamTag name={match.awayTeam} />
          </div>

          <time
            className="block mt-4 text-[0.65rem] font-bold tracking-[0.18em] uppercase text-[#1A1A1A]/35"
            dateTime={match.matchDate.toISOString()}
          >
            {dateLabel}
          </time>
        </header>

        <div className="mb-4 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/8 to-transparent shrink-0" />

        {/* ─── SCORE + VENUE + WINNER ─── */}
        <div className="flex flex-col gap-2.5 mb-5 h-[90px] shrink-0">
          <p className="text-[0.92rem] font-black tracking-tight leading-snug text-[#1A1A1A] line-clamp-2 uppercase">
            {cleanScoreSummary}
          </p>

          <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-[#1A1A1A]/40 leading-relaxed shrink-0">
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

          <div className="h-5 shrink-0">
            {match.winner && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[0.6rem] font-black tracking-wide uppercase">
                🏆 {normalizeTeamName(match.winner)}
              </div>
            )}
          </div>
        </div>

        {/* ─── ROAST TEASER ─── */}
        <div className="flex-1 mb-6 h-[72px] shrink-0 overflow-hidden">
          {roastTeaser ? (
            <blockquote className="relative pl-3 border-l-2 border-[#1A1A1A]/10 h-full">
              <p className="text-[0.78rem] leading-relaxed text-[#1A1A1A]/55 italic m-0 line-clamp-3">
                {roastTeaser}
              </p>
            </blockquote>
          ) : (
            <div className="flex flex-col justify-center h-full">
              <p className="text-[0.65rem] font-black text-[#1A1A1A]/15 uppercase tracking-[0.25em]">
                Roast In Progress
              </p>
              <div className="mt-2 w-8 h-0.5 bg-[#1A1A1A]/5" />
            </div>
          )}
        </div>

        {/* ─── FOOTER ─── */}
        <footer className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-[#1A1A1A]/35">
              🔥 {match.reactionsCount}
            </span>
            <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-[#1A1A1A]/35">
              💬 {match.commentsCount}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.7rem] font-black tracking-wide uppercase text-[#1A1A1A] border border-[#1A1A1A]/12 rounded-lg group-hover:bg-[#1A1A1A] group-hover:text-[#FCFBF7] transition-all">
            {isHistorical ? "Locked" : "Read"}
          </div>
        </footer>
      </Link>
    </article>
  );
}
