"use client";

// components/general/LandingCTA.tsx
// Closing CTA section — the final thing a visitor sees on the landing page.

import Link from "next/link";
import { motion } from "framer-motion";

export function LandingCTA() {
  return (
    <section
      className="relative py-24 px-6 md:px-16 bg-[#FCFBF7] overflow-hidden"
      aria-label="Get started"
    >
      {/* Subtle top hairline */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/8 to-transparent"
        aria-hidden="true"
      />

      {/* Large faded background text for personality */}
      <p
        className="absolute inset-0 flex items-center justify-center text-[clamp(5rem,18vw,14rem)] font-black text-[#1A1A1A]/[0.025] leading-none select-none pointer-events-none tracking-tighter"
        aria-hidden="true"
      >
        BAILS
      </p>

      <div className="mx-auto max-w-3xl relative z-10 text-center">
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-[0.68rem] font-black tracking-[0.22em] uppercase text-[#1A1A1A]/55"
        >
          Join the Carnage
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95] text-[#1A1A1A] mb-6"
        >
          Your team just lost.
          <br />
          <span className="text-[#1A1A1A]/40 font-light italic">
            We{"'"}ll make it funny.
          </span>
        </motion.h2>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-12 text-base text-[#1A1A1A]/45 font-medium leading-relaxed max-w-lg mx-auto"
        >
          Sign in to like roasts, drop your own takes in the comments, and
          contribute to the most unhinged cricket commentary on the internet.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/auth/signin"
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
            <span className="relative z-10 flex items-center gap-2">
              Sign In & Roast Along
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
          </Link>

          <Link
            href="/matches/2026"
            className="px-8 py-4 bg-white/50 backdrop-blur-sm border border-[#1A1A1A]/20 text-[#1A1A1A] font-bold rounded-lg transition-all hover:bg-white/80 hover:shadow-lg"
          >
            Browse All Roasts
          </Link>
        </motion.div>

        {/* Tiny disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-[0.65rem] font-semibold text-[#1A1A1A]/45 uppercase tracking-widest"
        >
          No subscription · No ads · Just roasts
        </motion.p>
      </div>

      {/* Footer label */}
      <p className="absolute bottom-6 left-0 right-0 text-center text-[0.6rem] font-black tracking-[0.25em] uppercase text-[#1A1A1A]/40 select-none">
        Bails on Fire &copy; {new Date().getFullYear()}
      </p>
    </section>
  );
}
