// components/general/RecentMatches.tsx
// Pure Server Component — newspaper broadsheet "Latest Dispatches" section.

import { getRecentMatches } from "@/lib/actions/matches";
import { NewspaperMatchCard } from "@/components/match/NewspaperMatchCard";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";

// ─── RecentMatches (Server Component) ────────────────────────────────────────

export async function RecentMatches() {
  const matches = await getRecentMatches(3);

  return (
    <section
      id="recent-matches"
      className="relative py-20 px-6 bg-[#FBFBF9] overflow-hidden"
      aria-label="Recent IPL matches"
    >
      {/* ── GRAIN OVERLAY ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-6xl">
        {/* ── SECTION HEADER (newspaper style) ─────────────────────── */}
        <header className="mb-14">
          {/* Double rule top */}
          <div className="w-full h-1 bg-slate-900" />
          <div className="w-full h-px bg-slate-900 mt-1 mb-6" />

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[0.6rem] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(225,29,72,0.4)]">
                  Latest Dispatches
                </span>
                <span className="px-2 py-0.5 border border-slate-900 text-slate-900 text-[0.6rem] font-bold uppercase tracking-tighter">
                  IPL 2026
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif leading-[1] text-slate-900 tracking-tighter uppercase">
                Recent Match Results
              </h2>
              <p className="mt-3 text-sm font-serif italic text-slate-500 max-w-md">
                Freshly roasted matches. Read the drama that just happened.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-widest text-slate-400">
              <Newspaper size={14} />
              <span>Page 2</span>
            </div>
          </div>

          {/* Bottom rule */}
          <div className="w-full h-px bg-slate-900/20 mt-6" />
        </header>

        {/* ── MATCH COLUMNS or EMPTY STATE ─────────────────────────── */}
        {matches.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-300">
            <p className="text-lg font-serif italic text-slate-400">
              &ldquo;The press has nothing to report. Suspicious.&rdquo;
            </p>
            <p className="mt-3 text-[0.65rem] font-black uppercase tracking-widest text-slate-400">
              No matches ingested yet — run the pipeline
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {matches.map((match, i) => (
              <NewspaperMatchCard
                key={match.id}
                match={match}
                index={i}
                isLast={i === matches.length - 1}
              />
            ))}
          </div>
        )}

        {/* ── VIEW ALL CTA (editorial style) ───────────────────────── */}
        <div className="mt-16">
          <div className="w-full h-px bg-slate-900/10 mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm font-serif italic text-slate-500 text-center sm:text-left">
              These are merely the opening acts. The full season of humiliation
              awaits in the archives.
            </p>

            <Link
              href="/matches/2026"
              className="group shrink-0 px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 transition-all flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(225,29,72,0.4)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              View All Matches
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* Bottom double rule */}
        <div className="mt-16 w-full h-px bg-slate-900/10" />
        <div className="w-full h-px bg-slate-900/5 mt-1" />
      </div>
    </section>
  );
}
