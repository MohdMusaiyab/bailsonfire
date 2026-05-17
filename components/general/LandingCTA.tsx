"use client";

// components/general/LandingCTA.tsx
// Closing CTA — vintage newspaper back‑page editorial sign‑off.

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";

export function LandingCTA() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const laughImages = [
    "/laugh1.gif",
    "/laugh2.jpg",
    "/laugh3.jpg",
    "/laugh4.jpeg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % laughImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [laughImages.length]);

  return (
    <section
      className="relative py-20 px-5 md:px-8 bg-[#F9F6EF] overflow-hidden"
      aria-label="Get started"
    >
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply"
        aria-hidden="true"
      />

      {/* Subtle watermark (vintage, faint) */}
      <p
        className="absolute inset-0 flex items-center justify-center text-[clamp(5rem,20vw,16rem)] font-serif font-bold text-[#2C2B28]/[0.03] leading-none select-none pointer-events-none tracking-tighter uppercase"
        aria-hidden="true"
      >
        BAILS
      </p>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Top rules */}
        <div className="w-full h-0.5 bg-[#2C2B28]" />
        <div className="w-full h-px bg-[#2C2B28]/40 mt-1 mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: Editorial text */}
          <div className="lg:col-span-8">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-[1.1] text-[#2C2B28] tracking-tighter uppercase mb-5"
            >
              Your team lost.
              <br />
              <span className="text-[#9B2C2C]">What&apos;s new?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg font-serif text-[#3A3126] leading-relaxed max-w-xl mb-8"
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
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#2C2B28] text-[#F9F6EF] font-mono font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#5A3A2A] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] active:translate-x-[1px] active:translate-y-[1px]"
              >
                Sign In &amp; Roast
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/matches/2026"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-[#2C2B28] text-[#2C2B28] font-mono font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#2C2B28] hover:text-[#F9F6EF] transition-all"
              >
                Browse All Roasts
                <Flame
                  size={14}
                  className="text-[#9B2C2C] group-hover:text-[#F9F6EF] transition-colors"
                />
              </Link>
            </motion.div>
          </div>

          {/* Right: Fading laugh reaction slideshow */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="border-2 border-[#2C2B28] p-4 bg-[#F3EFE6] shadow-[6px_6px_0_0_#2C2B28] w-full max-w-[280px] aspect-square overflow-hidden flex flex-col justify-between">
              <div className="text-[0.6rem] font-mono font-bold uppercase tracking-[0.2em] text-[#6B5E4A] border-b border-[#2C2B28]/10 pb-2 mb-3 flex justify-between items-center z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B2C2C] animate-ping" />
              </div>
              <div className="relative flex-grow w-full overflow-hidden border border-[#2C2B28]/25 bg-[#2C2B28]/5 min-h-[140px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={laughImages[currentImageIndex]}
                      alt="Cricket laugh reaction"
                      fill
                      sizes="280px"
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom rules */}
        <div className="mt-16 w-full h-px bg-[#2C2B28]/20" />
        <div className="w-full h-px bg-[#2C2B28]/10 mt-1" />
      </div>
    </section>
  );
}
