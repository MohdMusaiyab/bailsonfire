"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, Bot, Skull, MessageCircleWarning } from "lucide-react";

interface Reason {
  icon: React.ReactNode;
  tag: string;
  title: string;
  body: string;
  footnote: string;
}

const REASONS: Reason[] = [
  {
    icon: <Bot size={20} />,
    tag: "The Tech",
    title: "AI writes roasts, pray it delivers",
    body: " Gemini scans the ball‑by‑ball. Laughs out loud. Then blames luck because even AI knows explaining a run‑out off a no‑ball is impossible.",
    footnote: "I burn API tokens daily because मन कर रहा था",
  },
  {
    icon: <Flame size={20} />,
    tag: "The Why",
    title: "Nobody asked. I built it anyway.",
    body: "Zero people requested an AI that roasts IPL. Zero. I did it for the plot.",
    footnote: "No VC deck. No roadmap. Just vibes and an API key that's probably leaking.",
  },
  {
    icon: <MessageCircleWarning size={20} />,
    tag: "The Honesty",
    title: "TV commentary is NPC energy",
    body: "“Great intent” – bro edged a wide half‑volley to slip. We say what they won't. Main character energy only.",
    footnote: "Someone had to say it. Might as well be a sleep‑deprived robot.",
  },
  {
    icon: <Skull size={20} />,
    tag: "The Truth",
    title: "You'll read this. Then deny it.",
    body: "Nobody reads 'Why us' sections. Yet here you are, 4 cards deep, proving us wrong. That's either respect or copium.",
    footnote: "Made with questionable choices and a concerning lack of shame.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export function WhySection() {
  return (
    <section
      className="relative py-20 px-6 bg-[#FBFBF9] overflow-hidden"
      aria-label="Why Bails on Fire "
    >
      {/* Grain overlay – stronger for more "newspaper" feel */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-6xl">
        {/* Section header – unchanged but contrast improved */}
        <header className="mb-14">
          <div className="w-full h-1 bg-slate-900" />
          <div className="w-full h-px bg-slate-900 mt-1 mb-6" />

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[0.65rem] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(180,30,50,0.5)]">
                  Opinion
                </span>
                <span className="px-2 py-0.5 border border-slate-900 text-slate-900 text-[0.65rem] font-bold uppercase tracking-tighter">
                  Nobody Asked
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif leading-[1] text-slate-900 tracking-tighter uppercase">
                Why Bails on Fire&nbsp;?
              </h2>
              <p className="mt-3 text-sm font-serif italic text-slate-600 max-w-lg">
                No one requested this. We built it anyway. Here&apos;s the story no one will read (but you will).
              </p>
            </div>

            <p className="text-[0.65rem] font-black uppercase tracking-widest text-slate-500 max-w-[160px] text-right hidden sm:block leading-relaxed">
              Editor&apos;s note: We know you&apos;ll skip this section. You didn&apos;t.
            </p>
          </div>

          <div className="w-full h-px bg-slate-900/20 mt-6" />
        </header>

        {/* Cards – now with high‑contrast text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {REASONS.map((reason, i) => (
            <motion.article
              key={reason.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={cardVariants}
              className={`group relative p-8 md:p-10 ${
                i % 2 === 0 ? "md:border-r-2 border-slate-900/20" : ""
              } ${
                i < 2 ? "border-b-2 border-slate-900/20" : ""
              } hover:bg-slate-50 transition-colors duration-200`}
            >
              {/* Number watermark – darker for visibility */}
              <span
                className="absolute top-6 right-6 text-[5rem] font-serif leading-none text-slate-900/[0.15] select-none"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Tag + Icon */}
              <div className="flex items-center gap-3 mb-5">
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[0.6rem] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  {reason.tag}
                </span>
                <span className="text-slate-500">{reason.icon}</span>
              </div>

              {/* Title – darker + hover effect */}
              <h3 className="text-xl md:text-2xl font-serif leading-[1.15] text-slate-900 mb-4 uppercase group-hover:text-rose-700 transition-colors">
                {reason.title}
              </h3>

              {/* Body – increased contrast from slate-600 to slate-800 */}
              <p className="text-[0.95rem] font-serif text-slate-800 leading-relaxed mb-6">
                {reason.body}
              </p>

              {/* Footnote – now larger, darker, still italic */}
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 italic border-t border-slate-900/15 pt-4">
                {reason.footnote}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Bottom rules */}
        <div className="mt-16 w-full h-px bg-slate-900/15" />
        <div className="w-full h-px bg-slate-900/5 mt-1" />
      </div>
    </section>
  );
}