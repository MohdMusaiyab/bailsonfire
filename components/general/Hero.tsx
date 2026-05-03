"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero Component - Premium Off-White Version
 * 
 * UPDATES:
 * 1. Project Branding: Changed "IPL ROASTS" to "BAILS ON FIRE".
 * 2. Corrected Links: "See Latest Scorches" -> /matches/2026, "Wall of Shame" -> #wall-of-shame.
 * 3. Premium UI: Added floating geometric accents and refined typography.
 * 4. Modern UX: Smooth transitions and hover states using Framer Motion.
 */

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#FCFBF7]">
      {/* ── BACKGROUND ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-light.png"
          alt="Pristine cricket field at dawn"
          fill
          priority
          className="object-cover object-center opacity-30 mix-blend-multiply transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FCFBF7]/10 via-[#FCFBF7]/70 to-[#FCFBF7]" />
      </div>

      {/* ── FLOATING ACCENTS ───────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-12 w-64 h-64 bg-emerald-100/20 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-12 w-80 h-80 bg-amber-100/20 rounded-full blur-3xl" 
        />
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <div className="container relative z-10 px-6 mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center px-4 py-1.5 mb-10 text-[0.65rem] font-black tracking-[0.2em] uppercase rounded-full bg-white/60 backdrop-blur-md border border-[#1A1A1A]/5 text-[#1A1A1A]/70 shadow-sm"
          >
            <span className="relative flex w-2 h-2 mr-3" aria-hidden="true">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            IPL 2026 Season Coverage
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter text-[#1A1A1A]"
          >
            BAILS ON{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A]/80 to-[#1A1A1A]/40">
              FIRE
            </span>
            <br />
            <span className="text-3xl md:text-5xl lg:text-6xl font-light italic tracking-tight text-[#1A1A1A]/60 block mt-4">
              Scorching Every Stance.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-14 text-lg md:text-xl font-medium leading-relaxed text-[#1A1A1A]/50 max-w-2xl mx-auto"
          >
            Real-time AI-generated summaries that don{"\u2019"}t pull any
            punches. Witness the legendary collapses and lucky wins of IPL 2026
            with zero mercy.
          </motion.p>

          {/* CTA group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              href="/matches/2026"
              className="
                group relative px-10 py-5 font-black text-[0.7rem] tracking-[0.15em] uppercase rounded-xl overflow-hidden
                transition-all hover:scale-[1.02] active:scale-[0.98]
                shadow-2xl shadow-[#1A1A1A]/20
                bg-[#1A1A1A] text-[#FCFBF7]
              "
            >
              <span className="relative z-10 flex items-center">
                Explore 2026 Scorches
                <svg
                  className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            </Link>

            <Link 
              href="#wall-of-shame"
              className="
                group px-10 py-5 bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] font-black text-[0.7rem] tracking-[0.15em] uppercase rounded-xl 
                transition-all hover:bg-white hover:border-[#1A1A1A]/20 hover:shadow-xl hover:shadow-black/5
              "
            >
              Wall of Shame
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── SCROLL INDICATOR ───────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-gradient-to-b from-[#1A1A1A]/40 to-transparent"
        />
      </motion.div>

      {/* ── BOTTOM FADE ────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FCFBF7] via-[#FCFBF7]/80 to-transparent z-20 pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
};

export default Hero;
