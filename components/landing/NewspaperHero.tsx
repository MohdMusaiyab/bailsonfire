"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Newspaper, Flame, TrendingDown, CloudRain, AlertTriangle, ArrowRight } from "lucide-react";

interface NewspaperHeroProps {
  data: {
    latestMatch: any;
    breakingNews: any[];
    trendingScandals: any[];
    totalMatches: number;
  };
}

const NewspaperHero = ({ data }: NewspaperHeroProps) => {
  const { latestMatch, breakingNews, trendingScandals, totalMatches } = data;
  
  const leadRoast = latestMatch?.summaries[0];
  const leadHeadline = leadRoast?.headline || "THE DEATH OF INTENT";
  const leadContent = leadRoast?.content || "No roast available for this match yet.";

  // Format date for the masthead
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="relative pt-32 pb-20 px-6 bg-[#FBFBF9] overflow-hidden border-b-4 border-slate-900">
      {/* ── GRAIN OVERLAY ─────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]" />

      <div className="container relative z-10 mx-auto">
        {/* ── MASTHEAD ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-12 border-b-2 border-slate-900 pb-8">
          <div className="flex justify-between w-full mb-6 text-[0.65rem] font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><CloudRain size={12} /> WEATHER: 100% CHANCE OF TEARS</span>
              <span className="hidden md:block">VOL. 2026 / NO. {totalMatches || 0}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{latestMatch?.venue.split(",")[1]?.trim().toUpperCase() || "JAIPUR"}, INDIA</span>
              <span className="font-serif italic capitalize">{today}</span>
            </div>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12vw] md:text-[10rem] font-serif leading-[0.8] text-slate-900 tracking-tighter text-center selection:bg-rose-500 selection:text-white"
          >
            BAILS ON FIRE
          </motion.h1>
          
          <div className="w-full h-1 bg-slate-900 mt-6" />
          <div className="w-full h-px bg-slate-900 mt-1" />
          
          <div className="flex justify-center w-full py-4 overflow-hidden bg-slate-900 text-white mt-1">
             <div className="whitespace-nowrap flex items-center gap-12 animate-infinite-scroll">
                {[1, 2, 3].map((i) => (
                  <React.Fragment key={i}>
                    {breakingNews.map((news, idx) => (
                      <div key={`${i}-${idx}`} className="flex items-center gap-4 font-black text-[0.7rem] uppercase tracking-widest">
                        <Flame size={14} className="text-rose-500" />
                        {news.winner} SCORCHES {news.loser}: {news.scoreSummary}
                        <span className="text-slate-500">•</span>
                      </div>
                    ))}
                    {breakingNews.length === 0 && (
                      <div className="flex items-center gap-4 font-black text-[0.7rem] uppercase tracking-widest">
                        <Flame size={14} className="text-rose-500" />
                        BREAKING: IPL 2026 SEASON UNDERWAY
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
          
          {/* LEAD STORY (LEFT + CENTER) */}
          <div className="lg:col-span-8 border-r-0 lg:border-r-2 border-slate-900 pr-0 lg:pr-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[0.6rem] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">EDITORIAL</span>
                <span className="px-2 py-0.5 border border-slate-900 text-slate-900 text-[0.6rem] font-bold uppercase tracking-tighter">ROAST OF THE DAY</span>
                <span className="text-xs font-black uppercase text-slate-400">By Ravi Gupta</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-serif leading-[1.1] text-slate-900 mb-6 hover:text-rose-700 transition-colors cursor-default uppercase">
                {leadHeadline}
              </h2>

              <p className="text-xl md:text-2xl font-serif text-slate-700 leading-relaxed mb-8 first-letter:text-7xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-slate-900 first-letter:leading-[0.8] first-letter:pt-2">
                {leadContent.length > 350 ? `${leadContent.substring(0, 350)}...` : leadContent}
              </p>

              <div className="flex flex-wrap gap-4 mt-12">
                <Link 
                  href={`/match/${latestMatch?.externalId || "2026"}`}
                  className="group px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 transition-all flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(225,29,72,0.4)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  Read the Roast <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link 
                  href="/auth/sign-in"
                  className="px-8 py-4 border-2 border-slate-900 text-slate-900 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.2)]"
                >
                  Join the Mob
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
                Trending Scandals
                <TrendingDown size={18} className="text-rose-600" />
              </h3>

              <div className="space-y-8">
                {trendingScandals.map((item, idx) => (
                  <Link key={item.id} href={`/match/${item.externalId}`} className="group block border-b border-slate-200 pb-6 last:border-0">
                    <span className="text-[0.6rem] font-black text-rose-600 uppercase mb-1 block tracking-widest">{item.homeTeam} vs {item.awayTeam}</span>
                    <h4 className="text-xl font-serif group-hover:text-rose-600 transition-colors leading-snug uppercase">
                      {item.summaries[0]?.headline || "THE LATEST SCANDAL"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2">Recently Scorched • View Analysis</p>
                  </Link>
                ))}
                {trendingScandals.length === 0 && (
                  <p className="text-sm font-serif italic text-slate-400">No trending scandals yet. Stay tuned for the massacre.</p>
                )}
              </div>

              <div className="mt-12 p-6 bg-slate-100 border-2 border-slate-900 relative overflow-hidden group">
                <div className="absolute inset-0 bg-rose-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-[0.03]" />
                <AlertTriangle className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-200 group-hover:text-rose-200/50 transition-colors" />
                <h4 className="font-black text-xs uppercase mb-2 relative z-10 flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
                  Classifieds
                </h4>
                <p className="text-sm italic font-serif relative z-10 leading-relaxed text-slate-600">
                  "Missing: Middle order of Royal Challengers Bengaluru. Last seen in 2016. High reward for any sightings."
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default NewspaperHero;

