"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FCFBF7] px-4 py-12">
      {/* ── BACKGROUND ORBS (IMPROVED VISIBILITY) ──────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute rounded-full bg-[#1A1A1A]/5 blur-3xl"
          style={{ width: "400px", height: "400px", left: "-10%", top: "20%" }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full bg-[#1A1A1A]/5 blur-3xl"
          style={{
            width: "500px",
            height: "500px",
            right: "-15%",
            bottom: "10%",
          }}
          animate={{ x: [0, -40, 0], y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full bg-red-500/8 blur-3xl"
          style={{
            width: "300px",
            height: "300px",
            left: "20%",
            bottom: "30%",
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* REMOVED: Left and right architectural lines (were previously at 5% causing unwanted lines) */}

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl text-center space-y-10"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl shadow-[#1A1A1A]/5 border border-[#1A1A1A]/10 mb-6"
          >
            <ShieldAlert className="w-10 h-10 text-[#1A1A1A]" />
          </motion.div>

          <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-[#1A1A1A] leading-none">
            404
          </h1>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#1A1A1A] uppercase">
            Match Abandoned
          </h2>

          <p className="text-[#4A4A4A] text-lg font-medium max-w-md mx-auto leading-relaxed">
            The page you{"\u2019"}re looking for has been hit out of the park.
            It seems the DRS review couldn{"\u2019"}t find anything here.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#1A1A1A] text-[#FCFBF7] font-bold rounded-2xl hover:bg-[#2A2A2A] transition-all active:scale-[0.98] shadow-xl shadow-[#1A1A1A]/10 group"
          >
            <Home className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            Back to Pavilion
          </Link>

          <Link
            href="/matches/2026"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-[#1A1A1A] font-bold rounded-2xl border border-[#1A1A1A]/10 hover:bg-[#FCFBF7] transition-all active:scale-[0.98] shadow-lg shadow-[#1A1A1A]/5 group"
          >
            <Search className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            Explore Matches
          </Link>
        </div>

        <div className="pt-8 flex items-center justify-center gap-8 opacity-30">
          <div className="h-px w-12 bg-[#1A1A1A]" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#1A1A1A]">
            Bails On Fire
          </span>
          <div className="h-px w-12 bg-[#1A1A1A]" />
        </div>
      </motion.div>
    </section>
  );
}
