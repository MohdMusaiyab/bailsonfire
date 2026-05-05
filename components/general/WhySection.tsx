"use client";

// components/general/WhySection.tsx
// Lightweight static section — no DB calls. Pure personality.

import { motion } from "framer-motion";

const PILLARS = [
  {
    icon: "🤖",
    title: "AI that doesn't pull punches",
    body: "Gemini watches the match data so you don't have to. Then it writes the roast you were already thinking but were too polite to say.",
  },
  {
    icon: "🏏",
    title: "Because cricket deserves commentary",
    body: "Not the bland TV kind. The kind your WhatsApp group unleashes at 11 PM when someone just lost their last wicket chasing 90.",
  },
  {
    icon: "🔥",
    title: "Built for fun, not for funding",
    body: "No VC deck. No product roadmap. Just a cricket fan, a Gemini API key, and an unhealthy obsession with match scorelines.",
  },
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.12,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export function WhySection() {
  return (
    <section
      className="relative py-24 px-6 md:px-16 bg-[#FCFBF7] overflow-hidden"
      aria-label="Why Bails on Fire"
    >
      {/* Architectural accent lines */}
      <div
        className="absolute left-[5%] top-0 bottom-0 w-px bg-[#1A1A1A]/4 hidden xl:block"
        aria-hidden="true"
      />
      <div
        className="absolute right-[5%] top-0 bottom-0 w-px bg-[#1A1A1A]/4 hidden xl:block"
        aria-hidden="true"
      />

      {/* Subtle top hairline */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/8 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl">
        {/* ── HEADER ──────────────────────────────────────────────── */}
        <header className="mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-2 text-[0.68rem] font-black tracking-[0.22em] uppercase text-[#1A1A1A]/55"
          >
            The Origin Story
          </motion.p>

          <div className="flex items-baseline gap-6">
            <motion.h2
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-[#1A1A1A]"
            >
              Why Bails on Fire?
            </motion.h2>
            <div className="flex-1 h-px bg-[#1A1A1A]/5 hidden sm:block" />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-base text-[#1A1A1A]/50 font-medium max-w-lg leading-relaxed"
          >
            Because someone has to say what the TV commentators won{"'"}t.
          </motion.p>
        </header>

        {/* ── PILLARS ─────────────────────────────────────────────── */}
        <ul
          className="flex flex-wrap justify-center gap-6 list-none p-0 m-0"
          role="list"
        >
          {PILLARS.map((pillar, i) => (
            <motion.li
              key={pillar.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={cardVariants}
              className="flex w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)]"
            >
              <div className="group relative w-full p-8 bg-white border border-[#1A1A1A]/[0.06] rounded-2xl shadow-sm hover:-translate-y-1.5 hover:shadow-md transition-all duration-300">
                {/* Number watermark */}
                <span
                  className="absolute top-5 right-6 text-[4rem] font-black leading-none text-[#1A1A1A]/[0.04] select-none"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span
                  className="block text-3xl mb-5 transition-transform duration-300 group-hover:scale-110 origin-left"
                  aria-hidden="true"
                >
                  {pillar.icon}
                </span>

                <h3 className="text-[1rem] font-black tracking-tight leading-snug text-[#1A1A1A] mb-3">
                  {pillar.title}
                </h3>

                <p className="text-[0.82rem] leading-relaxed text-[#1A1A1A]/50 font-medium">
                  {pillar.body}
                </p>

                {/* Subtle bottom accent line */}
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/6 to-transparent" />
              </div>
            </motion.li>
          ))}
        </ul>

        {/* Bottom hairline */}
        <div
          className="mt-24 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/6 to-transparent"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
