// components/general/RecentMatches.tsx
// Pure Server Component — vintage broadsheet "Recent Matches" section.

import { getRecentMatches } from "@/lib/actions/matches";
import { NewspaperMatchCard } from "@/components/match/NewspaperMatchCard";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

export async function RecentMatches() {
  const matches = await getRecentMatches(3);

  return (
    <section
      id="recent-matches"
      className="relative py-20 px-5 md:px-8 bg-[#F9F6EF] overflow-hidden"
      aria-label="Recent IPL matches"
    >
      {/* Paper texture overlay – matches hero */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ── SECTION HEADER (minimal, no badges) ── */}
        <header className="mb-12">
          {/* Double rule top (vintage) */}
          <div className="w-full h-0.5 bg-[#2C2B28]" />
          <div className="w-full h-px bg-[#2C2B28]/40 mt-1 mb-6" />

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-[#2C2B28] leading-[1.1]">
                Recent Matches
              </h2>
              <p className="mt-3 text-sm sm:text-base font-serif italic text-[#6B5E4A] max-w-md">
                Fresh roasts from the last few disasters.
              </p>
            </div>
          </div>

          {/* Bottom rule */}
          <div className="w-full h-px bg-[#2C2B28]/20 mt-6" />
        </header>

        {/* ── MATCH GRID (or empty state) ── */}
        {matches.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-[#2C2B28]/20 bg-[#F3EFE6]">
            <p className="text-lg font-serif italic text-[#6B5E4A]">
              &ldquo;The press has nothing to report. Suspicious.&rdquo;
            </p>
            <p className="mt-3 text-[0.65rem] font-mono uppercase tracking-widest text-[#6B5E4A]">
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

        {/* ── VIEW ALL CTA (vintage style, no orange hover) ── */}
        <div className="mt-16">
          <div className="w-full h-px bg-[#2C2B28]/10 mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm sm:text-base font-serif italic text-[#3A3126] text-center sm:text-left">
              These are merely the opening acts. The full season of humiliation
              awaits in the archives.
            </p>

            <Link
              href="/matches/2026"
              className="group shrink-0 inline-flex items-center gap-2 bg-[#2C2B28] text-[#F9F6EF] px-8 py-4 text-sm sm:text-base font-mono font-bold uppercase tracking-[0.2em] hover:bg-[#5A3A2A] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] active:translate-x-[1px] active:translate-y-[1px]"
            >
              View All Matches
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* Bottom double rule (vintage) */}
        <div className="mt-16 w-full h-px bg-[#2C2B28]/20" />
        <div className="w-full h-px bg-[#2C2B28]/10 mt-1" />
      </div>
    </section>
  );
}
