import React from "react";
import { CircleDot, Image, Flame, Swords, ChartNoAxesCombined } from "lucide-react";

interface RoadmapItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
}

// ─── Roadmap items with sarcastic status labels (no emojis, Gen‑Z friendly) ───
const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    icon: <Image size={28} strokeWidth={1.5} />,
    title: "AI Memes",
    description:
      "Auto‑generated memes for every collapse. Because a 34(29) deserves a picture, not a paragraph. Low effort? Yes. So was that innings.",
    tag: "Cooking (slowly)",
    tagColor: "bg-amber-500",
  },
  {
    icon: <Flame size={28} strokeWidth={1.5} />,
    title: "User Roasts",
    description:
      "Write your own roasts. Get likes. Climb a leaderboard nobody will care about – we&apos;re building it anyway. Also adding a &apos;ratio&apos; counter because why not.",
    tag: "We&apos;ll get to it",
    tagColor: "bg-slate-600",
  },
  {
    icon: <Swords size={28} strokeWidth={1.5} />,
    title: "Fan Rivalries",
    description:
      "Trash talk rival fans directly. Think Twitter fights but with better grammar and worse sportsmanship. Report button? We&apos;ll think about it (we won&apos;t).",
    tag: "On the list, stop asking",
    tagColor: "bg-slate-600",
  },
  {
    icon: <ChartNoAxesCombined size={28} strokeWidth={1.5} />,
    title: "Live Roast Tracker",
    description:
      "A live graph of which team is getting trolled the most right now. Watch your team&apos;s reputation burn in real time. Copium levels off the charts.",
    tag: "Delulu dream",
    tagColor: "bg-rose-600",
  },
];

export function RoadmapSection() {
  return (
    <section
      className="relative py-20 px-6 bg-[#FBFBF9] overflow-hidden"
      aria-label="Roadmap"
    >
      {/* ── GRAIN OVERLAY ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-6xl">
        {/* ── SECTION HEADER ─────────────────────────────────────── */}
        <header className="mb-14">
          <div className="w-full h-1 bg-slate-900" />
          <div className="w-full h-px bg-slate-900 mt-1 mb-6" />

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[0.65rem] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(225,29,72,0.4)]">
                  Roadmap
                </span>
                <span className="px-2 py-0.5 border border-slate-900 text-slate-900 text-[0.65rem] font-bold uppercase tracking-tighter">
                  Promises, Promises
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif leading-[1] text-slate-900 tracking-tighter uppercase">
                What&apos;s Next?
              </h2>
              <p className="mt-3 text-sm font-serif italic text-slate-600 max-w-md">
                Features we swear we&apos;ll ship. Probably. No deadlines though.
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-slate-500 shrink-0 cursor-help"
              title="We're still arguing about it. ETA = never."
            >
              <CircleDot size={14} />
              <span>✋ Still arguing about it</span>
            </div>
          </div>

          <div className="w-full h-px bg-slate-900/20 mt-6" />
        </header>

        {/* ── ROADMAP GRID — Newspaper classifieds style ──────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {ROADMAP_ITEMS.map((item, i) => (
            <article
              key={i}
              className={`group relative p-6 md:p-8 transition-colors hover:bg-slate-50 ${
                i < ROADMAP_ITEMS.length - 1
                  ? "border-b lg:border-b-0 lg:border-r border-slate-900/15"
                  : ""
              }`}
            >
              {/* Number watermark */}
              <span
                className="absolute top-4 right-5 text-[4rem] font-serif leading-none text-slate-900/[0.15] select-none"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon (no emojis) */}
              <span className="block text-slate-700 mb-4 group-hover:scale-110 transition-transform origin-left">
                {item.icon}
              </span>

              {/* Status tag — bigger & readable */}
              <span
                className={`inline-block px-2 py-0.5 ${item.tagColor} text-white text-[0.65rem] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,0.6)] mb-4`}
              >
                {item.tag}
              </span>

              {/* Title */}
              <h3 className="text-lg font-serif leading-[1.2] text-slate-900 mb-3 uppercase group-hover:text-rose-700 transition-colors">
                {item.title}
              </h3>

              {/* Description — darker for better contrast */}
              <p className="text-[0.88rem] font-serif text-slate-700 leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        {/* ── Footer note ─────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t-2 border-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            ETA: When it&apos;s done. Don&apos;t @ us.
            <span className="block sm:inline text-[0.6rem] text-slate-400 ml-1">
              *We work on IST (I&apos;m Still Thinking)
            </span>
          </p>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Roast Engine — Live
            </span>
          </div>
        </div>

        {/* Bottom rules */}
        <div className="mt-12 w-full h-px bg-slate-900/10" />
        <div className="w-full h-px bg-slate-900/5 mt-1" />
      </div>
    </section>
  );
}