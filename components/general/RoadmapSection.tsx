import React from "react";
import { CircleDot, Image, Flame, Swords, ChartNoAxesCombined } from "lucide-react";

interface RoadmapItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
}

// Roadmap items – tags updated to vintage brown/red palette
const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    icon: <Image size={28} strokeWidth={1.5} />,
    title: "AI Memes",
    description:
      "Auto‑generated memes for every collapse. Because a 34(29) deserves a picture, not a paragraph. Low effort? Yes. So was that innings.",
    tag: "Cooking (slowly)",
    tagColor: "bg-[#9B2C2C]", // deep red
  },
  {
    icon: <Flame size={28} strokeWidth={1.5} />,
    title: "User Roasts",
    description:
      "Write your own roasts. Get likes. Climb a leaderboard nobody will care about – we're building it anyway. Also adding a 'ratio' counter because why not.",
    tag: "We'll get to it",
    tagColor: "bg-[#5A3A2A]", // vintage brown
  },
  {
    icon: <Swords size={28} strokeWidth={1.5} />,
    title: "Fan Rivalries",
    description:
      "Trash talk rival fans directly. Think Twitter fights but with better grammar and worse sportsmanship. Report button? We'll think about it (we won't).",
    tag: "On the list, stop asking",
    tagColor: "bg-[#5A3A2A]",
  },
  {
    icon: <ChartNoAxesCombined size={28} strokeWidth={1.5} />,
    title: "Live Roast Tracker",
    description:
      "A live graph of which team is getting trolled the most right now. Watch your team's reputation burn in real time. Copium levels off the charts.",
    tag: "Delulu dream",
    tagColor: "bg-[#9B2C2C]",
  },
];

export function RoadmapSection() {
  return (
    <section
      className="relative py-20 px-5 md:px-8 bg-[#F9F6EF] overflow-hidden"
      aria-label="Roadmap"
    >
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ── SECTION HEADER (minimal) ── */}
        <header className="mb-12">
          <div className="w-full h-0.5 bg-[#2C2B28]" />
          <div className="w-full h-px bg-[#2C2B28]/40 mt-1 mb-6" />

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-[#2C2B28] leading-[1.1]">
                What&apos;s Next?
              </h2>
              <p className="mt-3 text-sm sm:text-base font-serif italic text-[#3A3126] max-w-md">
                Features we swear we&apos;ll ship. Probably. No deadlines though.
              </p>
            </div>

            {/* Vintage "still arguing" indicator */}
            <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-wider text-[#3A3126] font-bold">
              <CircleDot size={12} className="text-[#9B2C2C]" />
              <span>✋ Still arguing about it</span>
            </div>
          </div>

          <div className="w-full h-px bg-[#2C2B28]/20 mt-6" />
        </header>

        {/* ── ROADMAP GRID (newspaper classifieds style) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {ROADMAP_ITEMS.map((item, i) => (
            <article
              key={i}
              className={`group relative p-6 md:p-8 transition-colors hover:bg-[#F3EFE6] ${
                i < ROADMAP_ITEMS.length - 1
                  ? "border-b lg:border-b-0 lg:border-r border-[#2C2B28]/15"
                  : ""
              }`}
            >
              {/* Number watermark */}
              <span
                className="absolute top-4 right-5 text-7xl font-serif font-black leading-none text-[#2C2B28]/25 select-none"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <span className="block text-[#9B2C2C] mb-4 group-hover:scale-110 transition-transform origin-left">
                {item.icon}
              </span>

              {/* Status tag – vintage colours */}
              <span
                className={`inline-block px-2 py-0.5 ${item.tagColor} text-[#F9F6EF] text-[0.6rem] font-mono font-bold uppercase tracking-tighter shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] mb-4`}
              >
                {item.tag}
              </span>

              {/* Title */}
              <h3 className="text-lg font-serif font-bold leading-[1.2] text-[#2C2B28] mb-3 uppercase tracking-tight group-hover:text-[#5A3A2A] transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-[0.88rem] font-serif text-[#3A3126] leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        {/* ── FOOTER NOTE (vintage, playful) ── */}
        <div className="mt-12 pt-6 border-t border-[#2C2B28]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[0.7rem] font-mono font-bold uppercase tracking-[0.2em] text-[#3A3126]">
            ETA: When it&apos;s done. Don&apos;t @ us.
            <span className="block sm:inline text-[0.6rem] text-[#3A3126]/70 ml-1">
              *We work on IST (I&apos;m Still Thinking)
            </span>
          </p>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#9B2C2C] animate-pulse" />
            <span className="text-[0.7rem] font-mono font-bold uppercase tracking-[0.2em] text-[#3A3126]">
              Roast Engine — Live
            </span>
          </div>
        </div>

        {/* Bottom rules */}
        <div className="mt-12 w-full h-px bg-[#2C2B28]/20" />
        <div className="w-full h-px bg-[#2C2B28]/10 mt-1" />
      </div>
    </section>
  );
}