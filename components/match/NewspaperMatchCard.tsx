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

// ─── Simple label for all cards ──────────────────────────────────────────
const CARD_LABEL = "Latest Roast";

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

  const dateLabel = match.matchDate.toLocaleDateString("en-IN", {
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

  const matchYear = match.matchDate.getFullYear();
  const isHistorical = matchYear < 2026;

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
          ? "border-b md:border-b-0 md:border-r border-slate-900/15"
          : ""
      } ${index === 0 ? "" : "md:pl-8"} ${isLast ? "" : "md:pr-8"} pb-10 md:pb-0`}
    >
      {/* ── Historical blur overlay ────────────────────────────────── */}
      {isHistorical && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FBFBF9]/60 backdrop-blur-[3px]">
          <div className="bg-slate-900 text-white px-4 py-2 text-[0.6rem] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_0px_rgba(225,29,72,0.4)]">
            Under Investigation
          </div>
          <p className="mt-3 text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
            Roasts from {matchYear} — Coming Soon
          </p>
        </div>
      )}

      {/* ── Label + Date ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <span className="px-2 py-0.5 bg-rose-600 text-white text-[0.55rem] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {CARD_LABEL}
        </span>
        <span className="text-[0.55rem] font-black uppercase tracking-widest text-slate-500">
          {dateLabel}
        </span>
      </div>

      {/* ── Matchup Line ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-2">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: teamColor(match.homeTeam) }}
            aria-hidden="true"
          />
          <span className="text-[0.7rem] font-black uppercase tracking-wide text-slate-900">
            {homeShort}
          </span>
        </span>
        <span className="text-[0.6rem] font-black text-slate-900 uppercase tracking-[0.2em]">
          vs
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: teamColor(match.awayTeam) }}
            aria-hidden="true"
          />
          <span className="text-[0.7rem] font-black uppercase tracking-wide text-slate-900">
            {awayShort}
          </span>
        </span>
      </div>

      {/* ── Headline ───────────────────────────────────────────────── */}
      <Link
        href={isHistorical ? "#" : `/match/${match.externalId}`}
        className={`block no-underline ${isHistorical ? "cursor-default" : ""}`}
      >
        <h3 className="text-2xl md:text-[1.65rem] font-serif leading-[1.15] text-slate-900 mb-3 group-hover:text-rose-700 transition-colors uppercase">
          {headline}
        </h3>
      </Link>

      {/* ── Score Summary ──────────────────────────────────────────── */}
      <p className="text-[0.75rem] font-black tracking-tight text-slate-600 uppercase mb-4 leading-relaxed">
        {cleanScore}
      </p>

      {/* ── Roast Teaser with Drop Cap ─────────────────────────────── */}
      <div className="flex-1 mb-6">
        {roastTeaser ? (
          <p className="text-[0.85rem] font-serif text-slate-600 leading-relaxed first-letter:text-4xl first-letter:font-serif first-letter:mr-2 first-letter:float-left first-letter:text-slate-900 first-letter:leading-[0.8] first-letter:pt-1">
            {roastTeaser}
          </p>
        ) : (
          <div className="border-2 border-dashed border-slate-300 p-4 bg-slate-50">
            <p className="text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
              Roast is being prepared. Our editors are working on it.
            </p>
          </div>
        )}
      </div>


      {/* ── Footer Stats + CTA ─────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-slate-900/10">
        <div className="flex items-center gap-4">
          {/* Winner badge */}
          {winnerNormalized && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[0.6rem] font-black uppercase tracking-wider text-emerald-700">
              <Trophy size={11} /> {getTeamShortName(winnerNormalized)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-slate-400">
            <Flame size={12} className="text-rose-500" />{" "}
            {match.reactionsCount}
          </span>
          <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-slate-400">
            <MessageCircle size={12} /> {match.commentsCount}
          </span>
        </div>

        {!isHistorical && (
          <Link
            href={`/match/${match.externalId}`}
            className="group/cta inline-flex items-center gap-1.5 text-[0.6rem] font-black uppercase tracking-[0.15em] text-slate-900 hover:text-rose-600 transition-colors"
          >
            Read Full Roast
            <ArrowRight
              size={12}
              className="transition-transform group-hover/cta:translate-x-0.5"
            />
          </Link>
        )}
      </div>
    </motion.article>
  );
}
