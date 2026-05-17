"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, TrendingDown, ArrowRight } from "lucide-react";
import { getTeamShortName, shortenTeamNamesInSummary } from "@/lib/utils/match";

interface HeroMatch {
  id: string;
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  scoreSummary?: string;
  matchDate?: Date | string; // string after unstable_cache JSON deserialization
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
  const { latestMatch, breakingNews, trendingScandals } = data;

  const leadRoast = latestMatch?.summaries[0];
  const leadHeadline = leadRoast?.headline || "THE DEATH OF INTENT";
  const leadContent = leadRoast?.content || "";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="relative pt-20 pb-20 px-5 md:px-8 bg-[#F9F6EF] overflow-hidden border-b-4 border-[#2C2B28]">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ── MASTHEAD ── */}
        <div className="text-center mb-12 border-b-2 border-[#2C2B28] pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-[15vw] sm:text-[12vw] md:text-9xl lg:text-[8rem] xl:text-[10rem] font-serif font-black tracking-tighter text-[#2C2B28] leading-[0.85]">
              BAILS ON FIRE
            </h1>
            <div className="text-sm sm:text-base md:text-lg font-mono text-[#6B5E4A] uppercase tracking-wider">
              {today}
            </div>
          </motion.div>

          {/* Breaking ticker – larger font on bigger screens */}
          <div className="w-full mt-8 bg-[#2C2B28] text-[#F9F6EF] py-3 overflow-hidden border-y border-[#4A4238]">
            <div className="whitespace-nowrap flex items-center gap-12 animate-infinite-scroll text-xs sm:text-sm md:text-base font-mono tracking-wider">
              {[1, 2].map((i) => (
                <React.Fragment key={i}>
                  {breakingNews.map((news, idx) => (
                    <div
                      key={`${i}-${idx}`}
                      className="inline-flex items-center gap-4"
                    >
                      <Flame size={16} className="text-[#9B2C2C] shrink-0" />
                      <span className="uppercase font-bold">
                        {getTeamShortName(news.winner || "UNKNOWN")} CRUSHED{" "}
                        {getTeamShortName(news.loser || "OPPONENT")}
                      </span>
                      <span className="text-[#B8A28E]">|</span>
                      <span className="font-serif">
                        {shortenTeamNamesInSummary(news.scoreSummary)}
                      </span>
                      {idx < breakingNews.length - 1 && (
                        <span className="text-[#B8A28E] mx-2">•</span>
                      )}
                    </div>
                  ))}
                  {breakingNews.length === 0 && (
                    <div className="inline-flex items-center gap-4">
                      <Flame size={16} className="text-[#9B2C2C]" />
                      <span>PRESS ROOM WARMING UP • ROASTS INBOUND</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── TWO‑COLUMN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-12">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Headline – much larger */}
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-[1.1] text-[#2C2B28] tracking-tight">
                {leadHeadline}
              </h2>

              {/* Drop cap + content – larger body text */}
              <div className="prose prose-lg sm:prose-xl font-serif text-[#3A3126] max-w-none">
                <p className="leading-relaxed text-base sm:text-lg md:text-xl">
                  <span className="float-left text-7xl sm:text-8xl md:text-9xl font-serif font-bold leading-[0.8] mr-3 text-[#2C2B28]">
                    {leadContent.charAt(0)}
                  </span>
                  {leadContent.slice(1)}
                </p>
              </div>

              {/* Match metadata – larger */}
              {latestMatch && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm sm:text-base font-mono text-[#6B5E4A] border-t border-[#2C2B28]/10 pt-5 mt-5">
                  <span>📍 {latestMatch.venue || "Unknown Venue"}</span>
                  <span>
                    📅{" "}
                    {latestMatch.matchDate
                      ? new Date(latestMatch.matchDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date TBD"}
                  </span>
                  {latestMatch.scoreSummary && (
                    <span>
                      🏏 {shortenTeamNamesInSummary(latestMatch.scoreSummary)}
                    </span>
                  )}
                </div>
              )}

              {/* Action buttons – larger, more comfortable */}
              <div className="flex flex-wrap gap-5 pt-4">
                <Link
                  href={`/match/${latestMatch?.externalId || "#"}`}
                  className="group inline-flex items-center gap-3 bg-[#2C2B28] text-[#F9F6EF] px-8 py-4 text-sm sm:text-base font-mono font-bold uppercase tracking-[0.2em] hover:bg-[#5A3A2A] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  Read Full Roast
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/matches/2026"
                  className="inline-flex items-center gap-3 border-2 border-[#2C2B28] px-8 py-4 text-sm sm:text-base font-mono font-bold uppercase tracking-[0.2em] text-[#2C2B28] hover:bg-[#2C2B28] hover:text-[#F9F6EF] transition-all"
                >
                  Browse Archives
                </Link>
              </div>
            </motion.div>

            {/* Short description – larger text */}
            <div className="border-l-4 border-[#9B2C2C] bg-[#F3EFE6] p-5 md:p-6">
              <p className="text-base sm:text-lg font-serif text-[#3A3126] leading-relaxed">
                <span className="font-bold uppercase tracking-wider text-[#2C2B28]">
                  Bails on Fire
                </span>{" "}
                – Just a LLM pretending it has a sense of humour. Results may vary
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN – Recent Victims */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between border-b-2 border-[#2C2B28] pb-3 mb-6">
                <h3 className="text-base sm:text-lg font-mono font-bold uppercase tracking-[0.2em] text-[#2C2B28]">
                  RECENT VICTIMS
                </h3>
                <TrendingDown size={20} className="text-[#9B2C2C]" />
              </div>

              <div className="space-y-8">
                {trendingScandals.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/match/${item.externalId}`}
                    className="group block border-b border-[#2C2B28]/10 pb-6 last:border-0"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-base sm:text-lg font-mono font-bold text-[#9B2C2C]">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#6B5E4A]">
                          {getTeamShortName(item.homeTeam)} vs{" "}
                          {getTeamShortName(item.awayTeam)}
                        </div>
                        <h4 className="font-serif text-xl sm:text-2xl font-bold leading-tight text-[#2C2B28] group-hover:text-[#5A3A2A] transition-colors mt-1">
                          {item.summaries[0]?.headline || "THE COLLAPSE"}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs sm:text-sm font-mono uppercase text-[#6B5E4A]">
                            Roast ready
                          </span>
                          <span className="w-1.5 h-1.5 bg-[#9B2C2C] rounded-full" />
                          <span className="text-xs sm:text-sm font-mono uppercase text-[#9B2C2C]">
                            Read →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {trendingScandals.length === 0 && (
                  <p className="text-base sm:text-lg font-serif italic text-[#6B5E4A]">
                    No victims yet. The press is warming up.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes infinite-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 25s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default NewspaperHero;
