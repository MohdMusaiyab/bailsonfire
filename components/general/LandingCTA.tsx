"use client";

// components/general/LandingCTA.tsx
// Closing CTA — newspaper back-page ad / editorial sign-off (dark background, improved readability)

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";

export function LandingCTA() {
  return (
    <section
      className="relative py-20 px-6 bg-slate-900 overflow-hidden"
      aria-label="Get started"
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]"
        aria-hidden="true"
      />

      {/* Watermark */}
      <p
        className="absolute inset-0 flex items-center justify-center text-[clamp(5rem,20vw,16rem)] font-serif text-white/[0.03] leading-none select-none pointer-events-none tracking-tighter uppercase"
        aria-hidden="true"
      >
        BAILS
      </p>

      <div className="container relative z-10 mx-auto max-w-5xl">
        {/* Top rules */}
        <div className="w-full h-1 bg-white/20" />
        <div className="w-full h-px bg-white/10 mt-1 mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: Editorial text */}
          <div className="lg:col-span-8">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-serif leading-[1.05] text-white tracking-tighter uppercase mb-5"
            >
              Your team lost.
              <br />
              <span className="text-rose-500">What&apos; s New in this.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base md:text-lg font-serif text-white/60 leading-relaxed max-w-xl mb-8"
            >
              Sign in to react, drop your hot takes in the comments, and join
              the most honest cricket commentary on the internet. No ads. No
              subscription. Just roasts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/auth/sign-in"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-rose-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-500 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                Sign In &amp; Roast
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/matches/2026"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-white/30 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all"
              >
                Browse All Roasts
                <Flame
                  size={14}
                  className="text-rose-500 group-hover:text-rose-600"
                />
              </Link>
            </motion.div>
          </div>

        {/* Right: Classifieds box (improved contrast) */}
        </div>
      </div>
    </section>
  );
}
