"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F9F6EF] px-4 py-12">
      {/* ── PAPER TEXTURE ────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
      
      {/* ── ARCHITECTURAL LINES ──────────────────────────────────── */}
      <div className="absolute left-[10%] top-0 bottom-0 w-0.5 bg-[#2C2B28]/10 hidden md:block" aria-hidden="true" />
      <div className="absolute right-[10%] top-0 bottom-0 w-0.5 bg-[#2C2B28]/10 hidden md:block" aria-hidden="true" />

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl text-center space-y-10 border-4 border-[#2C2B28] bg-[#F9F6EF] p-8 md:p-16 shadow-[8px_8px_0_0_rgba(0,0,0,0.2)]"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-[#2C2B28] mb-6"
          >
            <ShieldAlert className="w-10 h-10 text-[#F9F6EF]" />
          </motion.div>

          <h1 className="text-8xl md:text-9xl font-black font-serif tracking-tighter text-[#2C2B28] leading-none">
            404
          </h1>

          <div className="h-0.5 w-24 bg-[#2C2B28] mx-auto my-6" />

          <h2 className="text-2xl md:text-3xl font-black font-mono tracking-widest text-[#9B2C2C] uppercase border-y-2 border-dashed border-[#2C2B28] py-3 inline-block px-6">
            Match Abandoned
          </h2>

          <p className="text-[#3A3126] text-lg font-serif italic max-w-md mx-auto leading-relaxed mt-6">
            The page you&apos;re looking for has been hit out of the park.
            It seems the publisher&apos;s ink ran dry here.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#2C2B28] text-[#F9F6EF] font-mono font-bold uppercase tracking-widest border-2 border-[#2C2B28] shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
          >
            <Home className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Front Page
          </Link>

          <Link
            href="/matches/2026"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#F9F6EF] text-[#2C2B28] font-mono font-bold uppercase tracking-widest border-2 border-[#2C2B28] shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
          >
            <Search className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            Archives
          </Link>
        </div>

        <div className="pt-12 flex items-center justify-center gap-4 opacity-50">
          <div className="h-0.5 w-12 bg-[#2C2B28]" />
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-[#2C2B28]">
            End of Line
          </span>
          <div className="h-0.5 w-12 bg-[#2C2B28]" />
        </div>
      </motion.div>
    </section>
  );
}
