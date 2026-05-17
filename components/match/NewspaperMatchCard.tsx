"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { type RecentMatchCard } from "@/lib/validations/models";
import {
  normalizeTeamName,
  shortenTeamNamesInSummary,
  getTeamShortName,
} from "@/lib/utils/match";
import { Flame, MessageCircle, ArrowRight, Trophy } from "lucide-react";

// Team accent colours (keep as is – these are fine, just used for tiny dots)
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

export function NewspaperMatchCard({
  match,
  index,
  isLast,
}: {
  match: RecentMatchCard;
  index: number;
  isLast: boolean;
}) {
  const homeTeam = normalizeTeamName(match.homeTeam);
  const awayTeam = normalizeTeamName(match.awayTeam);
  const homeShort = getTeamShortName(match.homeTeam);
  const awayShort = getTeamShortName(match.awayTeam);
  const cleanScore = shortenTeamNamesInSummary(match.scoreSummary);

  const dateLabel = new Date(match.matchDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const headline =
    match.summary?.headline || `${homeShort} VS ${awayShort}: MATCH SUMMARY`;
  const roastTeaser = match.summary?.content
    ? match.summary.content.length > 200
      ? match.summary.content.slice(0, 197).trimEnd() + "\u2026"
      : match.summary.content
    : null;

  const winnerNormalized = match.winner
    ? normalizeTeamName(match.winner)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className={`group relative flex flex-col ${
        !isLast
          ? "border-b md:border-b-0 md:border-r border-[#2C2B28]/15"
          : ""
      } ${index === 0 ? "" : "md:pl-8"} ${isLast ? "" : "md:pr-8"} pb-10 md:pb-0`}
    >
      {/* Date only – no label badge */}
      <div className="mb-4">
        <span className="text-[0.55rem] font-mono font-bold uppercase tracking-widest text-[#6B5E4A]">
          {dateLabel}
        </span>
      </div>

      {/* Matchup line */}
      <div className="flex items-center gap-3 mb-2">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: teamColor(match.homeTeam) }}
            aria-hidden="true"
          />
          <span className="text-[0.7rem] font-mono font-bold uppercase tracking-wide text-[#2C2B28]">
            {homeShort}
          </span>
        </span>
        <span className="text-[0.6rem] font-mono font-bold text-[#2C2B28] uppercase tracking-[0.2em]">
          vs
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: teamColor(match.awayTeam) }}
            aria-hidden="true"
          />
          <span className="text-[0.7rem] font-mono font-bold uppercase tracking-wide text-[#2C2B28]">
            {awayShort}
          </span>
        </span>
      </div>

      {/* Headline */}
      <Link
        href={`/match/${match.externalId}`}
        className="block no-underline"
      >
        <h3 className="text-2xl md:text-[1.65rem] font-serif font-bold leading-[1.2] text-[#2C2B28] mb-3 group-hover:text-[#5A3A2A] transition-colors uppercase tracking-tight">
          {headline}
        </h3>
      </Link>

      {/* Score summary */}
      <p className="text-[0.75rem] font-mono font-bold tracking-tight text-[#6B5E4A] uppercase mb-4 leading-relaxed">
        {cleanScore}
      </p>

      {/* Roast teaser with drop cap */}
      <div className="flex-1 mb-6">
        {roastTeaser ? (
          <p className="text-[0.85rem] font-serif text-[#3A3126] leading-relaxed first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:text-[#2C2B28] first-letter:leading-[0.8] first-letter:pt-1">
            {roastTeaser}
          </p>
        ) : (
          <div className="border-2 border-dashed border-[#2C2B28]/20 p-4 bg-[#F3EFE6]">
            <p className="text-[0.65rem] font-mono font-bold text-[#6B5E4A] uppercase tracking-[0.2em] leading-relaxed">
              Roast is being prepared. Our editors are working on it.
            </p>
          </div>
        )}
      </div>

      {/* Footer stats + CTA */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-[#2C2B28]/10">
        <div className="flex items-center gap-4">
          {/* Winner badge */}
          {winnerNormalized && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[0.6rem] font-mono font-bold uppercase tracking-wider text-[#2C2B28]">
              <Trophy size={11} className="text-[#9B2C2C]" /> {getTeamShortName(winnerNormalized)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[0.65rem] font-mono font-bold text-[#6B5E4A]">
            <Flame size={12} className="text-[#9B2C2C]" />{" "}
            {match.reactionsCount}
          </span>
          <span className="inline-flex items-center gap-1 text-[0.65rem] font-mono font-bold text-[#6B5E4A]">
            <MessageCircle size={12} /> {match.commentsCount}
          </span>
        </div>

        <Link
          href={`/match/${match.externalId}`}
          className="group/cta inline-flex items-center gap-1.5 text-[0.6rem] font-mono font-bold uppercase tracking-[0.15em] text-[#2C2B28] hover:text-[#5A3A2A] transition-colors"
        >
          Read Full Roast
          <ArrowRight
            size={12}
            className="transition-transform group-hover/cta:translate-x-0.5"
          />
        </Link>
      </div>
    </motion.article>
  );
}