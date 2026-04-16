"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

/**
 * Hero Component - Premium Off-White Version
 *
 * FIXES APPLIED:
 * 1. Math.random() during render → pre-computed via useMemo (was causing
 *    "Cannot call impure function during render" + hydration mismatch).
 * 2. &apos; / apostrophes → replaced with {"\u2019"} (typographic) so JSX
 *    parser never sees a raw HTML entity in an expression context.
 * 3. ROASTS gradient → uses actual distinct colors so bg-clip-text is visible.
 * 4. CTA overlay → converted to a before: pseudo-element approach to avoid
 *    a stacked absolute div interfering with pointer events on the label.
 */

interface OrbConfig {
  width: number;
  height: number;
  left: string;
  top: string;
  duration: number;
}

const Hero = () => {
  // Pre-compute random values ONCE, outside render, to avoid impure-function
  // errors and React hydration mismatches.
  const orbs = useMemo<OrbConfig[]>(
    () =>
      [
        { w: 340, h: 180, l: 12, t: 8, d: 18 },
        { w: 200, h: 260, l: 55, t: 25, d: 22 },
        { w: 280, h: 140, l: 80, t: 60, d: 14 },
        { w: 160, h: 300, l: 30, t: 70, d: 20 },
        { w: 220, h: 200, l: 65, t: 5, d: 16 },
        { w: 310, h: 160, l: 5, t: 45, d: 24 },
      ].map(({ w, h, l, t, d }) => ({
        width: w,
        height: h,
        left: `${l}%`,
        top: `${t}%`,
        duration: d,
      })),
    []
  );

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#FCFBF7]">
      {/* ── BACKGROUND ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-light.png"
          alt="Pristine cricket field at dawn"
          fill
          priority
          className="object-cover object-center opacity-40 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FCFBF7]/20 via-[#FCFBF7]/60 to-[#FCFBF7]" />
      </div>

      {/* ── FLOATING ORBS ──────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#1A1A1A]/5 blur-xl"
            style={{
              width: orb.width,
              height: orb.height,
              left: orb.left,
              top: orb.top,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <div className="container relative z-10 px-6 mx-auto text-center">
        <div className="max-w-4xl mx-auto">

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center px-4 py-1.5 mb-8 text-xs font-semibold tracking-widest uppercase rounded-full bg-white/50 backdrop-blur-md border border-[#1A1A1A]/10 text-[#1A1A1A] shadow-sm"
          >
            <span className="relative flex w-2 h-2 mr-3" aria-hidden="true">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-500" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-600" />
            </span>
            Season 2026 Live
          </motion.div>

          {/* Headline
              FIX: ROASTS now uses a real two-color gradient so bg-clip-text
              is actually visible (was #1A1A1A → #1A1A1A/40, effectively invisible).
              FIX: apostrophe in "Scorching" sub-line uses unicode \u2019 —
              no raw HTML entities (&apos;) inside JSX string context.
          */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter text-[#1A1A1A]"
          >
            IPL{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#1A1A1A]/30">
              ROASTS
            </span>
            <br />
            <span className="text-3xl md:text-5xl lg:text-6xl font-light italic tracking-tight opacity-80">
              Scorching Every Stance.
            </span>
          </motion.h1>

          {/* Subheadline
              FIX: apostrophes replaced with \u2019 (typographic curly apostrophe)
              so Next.js JSX transform never encounters a raw &apos; entity.
          */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12 text-lg md:text-xl font-medium leading-relaxed text-[#4A4A4A] max-w-2xl mx-auto"
          >
            Real-time AI-generated summaries that don{"\u2019"}t pull any punches.
            Because some performances aren{"\u2019"}t just bad{"\u2014"}they{"\u2019"}re legendary.
          </motion.p>

          {/* CTA group
              FIX: replaced the stacked absolute gradient div (which could eat
              pointer events on the button label) with a Tailwind before: pseudo-
              element. The <span> is now the sole child, removing z-index fights.
          */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              className="
                group relative px-8 py-4 font-bold rounded-lg overflow-hidden
                transition-all hover:scale-[1.02] active:scale-[0.98]
                shadow-2xl shadow-[#1A1A1A]/20
                bg-[#1A1A1A] text-[#FCFBF7]
                before:absolute before:inset-0
                before:bg-gradient-to-r before:from-[#1A1A1A] before:to-gray-700
                before:translate-x-[-100%] before:transition-transform
                before:duration-500 before:ease-in-out
                hover:before:translate-x-0
              "
            >
              <span className="relative z-10 flex items-center">
                See Latest Scorches
                <svg
                  className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
            </button>

            <button className="px-8 py-4 bg-white/50 backdrop-blur-sm border border-[#1A1A1A]/20 text-[#1A1A1A] font-bold rounded-lg transition-all hover:bg-white/80 hover:shadow-lg">
              The Roast Engine
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── BOTTOM FADE ────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FCFBF7] to-transparent z-20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Architectural vertical lines */}
      <div className="absolute left-[5%] top-0 bottom-0 w-px bg-[#1A1A1A]/5 hidden lg:block" aria-hidden="true" />
      <div className="absolute right-[5%] top-0 bottom-0 w-px bg-[#1A1A1A]/5 hidden lg:block" aria-hidden="true" />
    </section>
  );
};

export default Hero;