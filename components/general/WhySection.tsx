"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Flame, Bot, Skull, MessageCircleWarning } from "lucide-react";

interface Reason {
  icon: React.ReactNode;
  title: string;
  body: string;
  footnote: string;
}

// Tighter, funnier, more self‑aware copy
const REASONS: Reason[] = [
  {
    icon: <Bot size={20} />,
    title: "AI trying to be funny",
    body: "I fed Gemini every IPL meltdown. It learned sarcasm from Reddit. The results are either genius or a war crime.",
    footnote: "No AI was harmed. But several API keys cried.",
  },
  {
    icon: <Flame size={20} />,
    title: "Nobody asked for this",
    body: "Zero market research. Zero demand. Just a sleep‑deprived dev who wanted to use some API keys",
    footnote: "This is what burnout looks like.",
  },
  {
    icon: <MessageCircleWarning size={20} />,
    title: "Commentary is NPC energy",
    body: "“Great intent” – bro edged to slip. We replace platitudes with pyrotechnics. IDK What that means",
    footnote: "Main character energy only.",
  },
  {
    icon: <Skull size={20} />,
    title: "You'll read this. Then deny it.",
    body: "Nobody reads 'Why us' sections. Yet here you are, four cards deep. That's either respect or copium.",
    footnote: "Made with questionable choices and zero shame.",
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export function WhySection() {
  return (
    <section
      className="relative py-20 px-5 md:px-8 bg-[#F9F6EF] overflow-hidden"
      aria-label="Why Bails on Fire"
    >
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header – minimal, no badges */}
        <header className="mb-12">
          <div className="w-full h-0.5 bg-[#2C2B28]" />
          <div className="w-full h-px bg-[#2C2B28]/40 mt-1 mb-6" />

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-[#2C2B28] leading-[1.1]">
                Why Bails on Fire?
              </h2>
              <p className="mt-3 text-sm sm:text-base font-serif italic text-[#3A3126] max-w-lg">
                No one asked for this. U built it anyway. Here&apos;s the story
                you&apos;ll probably skip.
              </p>
            </div>

            {/* Small vintage editorial note */}
            <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-wider text-[#3A3126] font-bold">
              <span className="w-2 h-2 bg-[#9B2C2C] rounded-full" />
              <span>Editor&apos;s note: You didn&apos;t skip.</span>
            </div>
          </div>

          <div className="w-full h-px bg-[#2C2B28]/20 mt-6" />
        </header>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {REASONS.map((reason, i) => (
            <motion.article
              key={reason.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={cardVariants}
              className={`group relative p-6 md:p-8 ${
                i % 2 === 0 ? "md:border-r border-[#2C2B28]/15" : ""
              } ${
                i < 2 ? "border-b border-[#2C2B28]/15" : ""
              } hover:bg-[#F3EFE6] transition-colors duration-200`}
            >
              {/* Number watermark – vintage style */}
              <span
                className="absolute top-4 right-4 text-7xl font-serif font-black leading-none text-[#2C2B28]/25 select-none"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon only (no tag badge) – cleaner */}
              <div className="mb-4 text-[#9B2C2C]">{reason.icon}</div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-serif font-bold leading-[1.2] text-[#2C2B28] mb-3 uppercase tracking-tight group-hover:text-[#5A3A2A] transition-colors">
                {reason.title}
              </h3>

              {/* Body */}
              <p className="text-sm md:text-base font-serif text-[#3A3126] leading-relaxed mb-5">
                {reason.body}
              </p>

              {/* Footnote – vintage italic */}
              <p className="text-[0.7rem] font-mono uppercase tracking-wider text-[#3A3126] font-bold italic border-t border-[#2C2B28]/15 pt-3">
                {reason.footnote}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Bottom rules */}
        <div className="mt-16 w-full h-px bg-[#2C2B28]/20" />
        <div className="w-full h-px bg-[#2C2B28]/10 mt-1" />
      </div>
    </section>
  );
}
