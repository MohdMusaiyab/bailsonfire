// components/general/RecentMatches.tsx
// Pure Server Component — no client JS needed, pure Tailwind styling.

import { getRecentMatches } from "@/lib/actions/matches";
import { type RecentMatchCard } from "@/lib/validations/models";
import { MatchCard } from "@/components/match/MatchCard";



// ─── RecentMatches (Server Component) ────────────────────────────────────────

export async function RecentMatches() {
  const matches = await getRecentMatches(3);

  return (
    <section
      className="relative py-24 px-6 md:px-16 bg-[#FCFBF7]"
      aria-label="Recent IPL matches"
    >
      {/* Architectural vertical accent lines — mirrors Hero */}
      <div className="absolute left-[5%] top-0 bottom-0 w-px bg-[#1A1A1A]/4 hidden xl:block" aria-hidden="true" />
      <div className="absolute right-[5%] top-0 bottom-0 w-px bg-[#1A1A1A]/4 hidden xl:block" aria-hidden="true" />

      <div className="mx-auto max-w-6xl">

        {/* ── SECTION HEADER ─────────────────────────────────────── */}
        <header className="mb-14">
          {/* overline label — same style as Hero's live badge text */}
          <p className="mb-2 text-[0.68rem] font-black tracking-[0.22em] uppercase text-[#1A1A1A]/30">
            IPL 2026 · Season Highlights
          </p>

          {/* Section title row: h2 + extending hairline */}
          <div className="flex items-baseline gap-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-[#1A1A1A]">
              Recent Matches
            </h2>
            {/* horizontal rule that stretches to fill remaining space */}
            <div className="flex-1 h-px bg-[#1A1A1A]/5 hidden sm:block" />
          </div>
        </header>

        {/* ── MATCH GRID or EMPTY STATE ──────────────────────────── */}
        {matches.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-[#1A1A1A]/30 uppercase tracking-widest">
              No matches yet.{" "}
              <code className="font-mono normal-case tracking-normal bg-[#1A1A1A]/5 px-2 py-0.5 rounded">
                npx tsx scripts/ingest.ts
              </code>
            </p>
          </div>
        ) : (
          <ul
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0 m-0"
            role="list"
          >
            {matches.map((match, i) => (
              <li key={match.id} className="flex">
                <MatchCard match={match} index={i} />
              </li>
            ))}
          </ul>
        )}

        {/* ── VIEW ALL CTA ───────────────────────────────────────── */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <p className="text-[0.72rem] font-bold text-[#1A1A1A]/30 uppercase tracking-[0.15em]">
            Hungry for more? Explore the full season roasts.
          </p>
          <a
            href="/matches/2026"
            className="group relative inline-flex items-center gap-3 px-10 py-4 bg-[#1A1A1A] text-[#FCFBF7] rounded-full text-[0.75rem] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-black/10"
          >
            Explore All 2026 Roasts
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Bottom hairline — same as Hero's bottom fade language */}
        <div className="mt-24 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/6 to-transparent" aria-hidden="true" />
      </div>
    </section>
  );
}
