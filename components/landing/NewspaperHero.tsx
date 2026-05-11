"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Flame,
  TrendingDown,
  CloudRain,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Newspaper,
} from "lucide-react";
import { getTeamShortName, shortenTeamNamesInSummary } from "@/lib/utils/match";

interface HeroMatch {
  id: string;
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  scoreSummary?: string;
  matchDate?: Date;
  venue?: string;
  summaries: {
    id: string;
    headline: string | null;
    content: string;
  }[];
}

interface BreakingNews {
  winner: string | null;
  loser: string | null;
  scoreSummary: string;
  externalId: string;
}

interface NewspaperHeroProps {
  data: {
    latestMatch: HeroMatch | null;
    breakingNews: BreakingNews[];
    trendingScandals: HeroMatch[];
    totalMatches: number;
  };
}

const NewspaperHero = ({ data }: NewspaperHeroProps) => {
  const { latestMatch, breakingNews, trendingScandals, totalMatches } = data;

  console.log("DEBUG: DB Marquee Data (breakingNews):", breakingNews);

  const leadRoast = latestMatch?.summaries[0];
  const leadHeadline = leadRoast?.headline || "THE DEATH OF INTENT";

  // Format date for the masthead
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="relative pt-24 pb-20 px-6 bg-[#FBFBF9] overflow-hidden border-b-4 border-slate-900">
      {/* ── GRAIN OVERLAY ─────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]" />

      <div className="container relative z-10 mx-auto">
        {/* ── MASTHEAD ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-12 border-b-2 border-slate-900 pb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12vw] md:text-[10rem] font-serif leading-[0.8] text-slate-900 tracking-tighter text-center selection:bg-rose-500 selection:text-white"
          >
            BAILS ON FIRE
          </motion.h1>

          <div className="w-full h-1 bg-slate-900 mt-6" />
          <div className="w-full h-px bg-slate-900 mt-1" />

          {/* Breaking Ticker */}
          <div className="flex justify-center w-full py-3 overflow-hidden bg-slate-900 text-white mt-1">
            <div className="whitespace-nowrap flex items-center gap-12 animate-infinite-scroll">
              {[1, 2].map((i) => (
                <React.Fragment key={i}>
                  {breakingNews.map((news, idx) => (
                    <div
                      key={`${i}-${idx}`}
                      className="flex items-center gap-4 font-black text-[0.7rem] uppercase tracking-widest"
                    >
                      <Flame size={14} className="text-rose-500" />
                      {getTeamShortName(news.winner || "") ||
                        "UNKNOWN"} CRUSHED{" "}
                      {getTeamShortName(news.loser || "") || "OPPONENT"}:{" "}
                      {shortenTeamNamesInSummary(news.scoreSummary)}
                      <span className="text-slate-500">•</span>
                    </div>
                  ))}
                  {breakingNews.length === 0 && (
                    <div className="flex items-center gap-4 font-black text-[0.7rem] uppercase tracking-widest">
                      <Flame size={14} className="text-rose-500" />
                      BREAKING: AI MODELS LOADED & READY TO ROAST
                      <span className="text-slate-500">•</span>
                      EXPECT UNPRECEDENTED LEVELS OF SARCASM
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── FRONT PAGE GRID ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEAD STORY COLUMN (LEFT + CENTER) */}
          <div className="lg:col-span-8 border-r-0 lg:border-r-2 border-slate-900 pr-0 lg:pr-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[0.6rem] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  EDITORIAL
                </span>
                <span className="px-2 py-0.5 border border-slate-900 text-slate-900 text-[0.6rem] font-bold uppercase tracking-tighter">
                  LATEST DISPATCH
                </span>
              </div>

              <h2 className="text-5xl md:text-7xl font-serif leading-[1] text-slate-900 mb-8 hover:text-rose-700 transition-colors cursor-default uppercase tracking-tighter">
                {leadHeadline}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <p className="text-lg font-serif text-slate-700 leading-relaxed italic">
                    &quot;The wicket was flat, the intent was flatter. Another
                    day, another tactical disasterclass served on a
                    platter...&quot;
                  </p>
                  <p className="text-sm font-serif text-slate-500 leading-relaxed">
                    Our AI models have processed the wreckage of the latest
                    match. The results are as predictable as a middle-order
                    collapse in a run chase.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)] relative overflow-hidden">
                  <Terminal
                    size={40}
                    className="absolute -right-4 -bottom-4 text-slate-900/5 rotate-12"
                  />
                  <h3 className="font-black text-[0.65rem] uppercase tracking-widest text-rose-600 mb-3 flex items-center gap-2">
                    <Newspaper size={14} /> Mission Statement
                  </h3>
                  <p className="text-[0.85rem] font-serif text-slate-900 leading-relaxed">
                    <strong>Bails on Fire</strong> is the internet&apos;s most
                    cynical cricket companion. We use advanced AI to say the
                    things commentators are too polite to mention. We don&apos;t
                    care about &quot;good intent&quot; &mdash; we care about the
                    roast.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-12 pt-8 border-t border-slate-900/10">
                <Link
                  href={`/match/${latestMatch?.externalId || "2026"}`}
                  className="group px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 transition-all flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(225,29,72,0.4)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  Read Today&apos;s Roast{" "}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/matches/2026"
                  className="px-8 py-4 border-2 border-slate-900 text-slate-900 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.2)]"
                >
                  Browse Archives
                </Link>
              </div>
            </motion.div>
          </div>

          {/* SIDEBAR (RIGHT) */}
          <div className="lg:col-span-4 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-black uppercase border-b-2 border-slate-900 pb-2 mb-6 flex items-center justify-between">
                Recent Victims
                <TrendingDown size={18} className="text-rose-600" />
              </h3>

              <div className="space-y-8">
                {trendingScandals.map((item) => (
                  <Link
                    key={item.id}
                    href={`/match/${item.externalId}`}
                    className="group block border-b border-slate-200 pb-6 last:border-0"
                  >
                    <span className="text-[0.6rem] font-black text-rose-600 uppercase mb-1 block tracking-widest">
                      {getTeamShortName(item.homeTeam)} vs{" "}
                      {getTeamShortName(item.awayTeam)}
                    </span>
                    <h4 className="text-xl font-serif group-hover:text-rose-600 transition-colors leading-[1.2] uppercase tracking-tight">
                      {item.summaries[0]?.headline || "ANOTHER DISASTERCLASS"}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[0.55rem] font-black uppercase text-slate-400">
                        Analysis Complete
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-[0.55rem] font-black uppercase text-rose-500">
                        View Roast
                      </span>
                    </div>
                  </Link>
                ))}
                {trendingScandals.length === 0 && (
                  <p className="text-sm font-serif italic text-slate-400">
                    The field is currently quiet. Too quiet. A collapse is
                    imminent.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewspaperHero;
