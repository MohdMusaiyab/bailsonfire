// components/general/WallOfShame.tsx
// Server Component — fetches the most-liked match for a dramatic spotlight.

import Link from "next/link";
import { getWallOfShame } from "@/lib/actions/matches";

// ─── Team accent colours (same map as MatchCard) ────────────────────────────
const TEAM_COLORS: Record<string, string> = {
  "Mumbai Indians": "#004BA0",
  "Chennai Super Kings": "#C8A800",
  "Royal Challengers Bengaluru": "#CC1020",
  "Kolkata Knight Riders": "#552791",
  "Delhi Capitals": "#0078BC",
  "Sunrisers Hyderabad": "#D4881E",
  "Rajasthan Royals": "#EA1A85",
  "Punjab Kings": "#C41020",
  "Lucknow Super Giants": "#3B82F6",
  "Gujarat Titans": "#1C1C1C",
};
const teamColor = (name: string) => TEAM_COLORS[name] ?? "#6B7280";

export async function WallOfShame() {
  const match = await getWallOfShame();

  return (
    <section
      id="wall-of-shame"
      className="relative py-24 px-6 md:px-16 bg-[#FCFBF7] overflow-hidden"
      aria-label="Wall of Shame – most liked roast"
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
        {/* ── SECTION HEADER ──────────────────────────────────────── */}
        <header className="mb-14">
          <p className="mb-2 text-[0.68rem] font-black tracking-[0.22em] uppercase text-[#1A1A1A]/55">
            Community Verdict
          </p>
          <div className="flex items-baseline gap-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-[#1A1A1A]">
              Wall of Shame
            </h2>
            <div className="flex-1 h-px bg-[#1A1A1A]/5 hidden sm:block" />
          </div>
          <p className="mt-3 text-sm text-[#1A1A1A]/40 font-medium max-w-md">
            The roast the internet can{"'"}t stop liking. Chosen by you.
          </p>
        </header>

        {/* ── CONTENT ─────────────────────────────────────────────── */}
        {match === null ? (
          /* ── EMPTY STATE ──────────────────────────────────────── */
          <div className="relative flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-[#1A1A1A]/10 bg-white/40 text-center gap-5">
            {/* flame icon placeholder */}
            <span
              className="text-5xl select-none opacity-30"
              aria-hidden="true"
            >
              🏆
            </span>
            <div>
              <p className="text-[0.75rem] font-black tracking-[0.2em] uppercase text-[#1A1A1A]/50 mb-1">
                Nothing here yet
              </p>
              <p className="text-sm font-medium text-[#1A1A1A]/35 max-w-xs mx-auto leading-relaxed">
                The Wall of Shame will be filled once a roast gets its first
                reaction. Be the first to crown a disaster.
              </p>
            </div>
            <Link
              href="/matches/2026"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#1A1A1A]/12 text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FCFBF7] transition-all"
            >
              Browse roasts
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        ) : (
          /* ── SPOTLIGHT CARD ───────────────────────────────────── */
          <div className="relative group">
            {/* Glow halo behind card */}
            <div
              className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#1A1A1A]/8 via-transparent to-[#1A1A1A]/4 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              aria-hidden="true"
            />

            <article className="relative grid md:grid-cols-[1fr_auto] gap-0 bg-white border border-[#1A1A1A]/[0.07] rounded-3xl shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-lg">
              {/* Left accent bar — loser team colour */}
              {match.loser && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl"
                  style={{ background: teamColor(match.loser) }}
                  aria-hidden="true"
                />
              )}

              {/* ── MAIN CONTENT ─────────────────────────────────── */}
              <div className="p-8 md:p-10 pl-10">
                {/* Crown badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[0.65rem] font-black tracking-widest uppercase">
                  <span aria-hidden="true">🏆</span>
                  Most Reacted Roast
                </div>

                {/* Teams */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="flex items-center gap-2 text-base font-black text-[#1A1A1A]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: teamColor(match.homeTeam) }}
                      aria-hidden="true"
                    />
                    {match.homeTeam}
                  </span>
                  <span className="text-[0.6rem] font-black tracking-[0.2em] uppercase text-[#1A1A1A]/25">
                    vs
                  </span>
                  <span className="flex items-center gap-2 text-base font-black text-[#1A1A1A]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: teamColor(match.awayTeam) }}
                      aria-hidden="true"
                    />
                    {match.awayTeam}
                  </span>
                </div>

                {/* Score */}
                <p className="text-[1.05rem] font-black tracking-tight text-[#1A1A1A] mb-1">
                  {match.scoreSummary}
                </p>

                {/* Venue + date */}
                <p className="text-[0.68rem] font-semibold text-[#1A1A1A]/35 mb-6">
                  {match.venue} &middot;{" "}
                  {match.matchDate.toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {/* Roast excerpt */}
                {match.summary && (
                  <blockquote className="relative pl-4 border-l-2 border-[#1A1A1A]/10 mb-8">
                    <p className="text-[0.88rem] leading-relaxed text-[#1A1A1A]/60 italic">
                      {match.summary.content.length > 240
                        ? match.summary.content.slice(0, 237).trimEnd() +
                          "\u2026"
                        : match.summary.content}
                    </p>
                  </blockquote>
                )}

                {/* Footer row */}
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-[#1A1A1A]/40">
                    🔥 {match.reactionsCount.toLocaleString()} reactions
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-[#1A1A1A]/40">
                    💬 {match.commentsCount.toLocaleString()} comments
                  </span>
                  {match.winner && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[0.65rem] font-black tracking-wide uppercase">
                      🏆 {match.winner}
                    </span>
                  )}
                </div>
              </div>

              {/* ── RIGHT CTA PANEL ──────────────────────────────── */}
              <div className="flex items-center justify-center p-8 bg-[#1A1A1A]/[0.025] border-t md:border-t-0 md:border-l border-[#1A1A1A]/[0.05]">
                <Link
                  href={`/match/${match.externalId}`}
                  className="group/btn flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border border-[#1A1A1A]/10 bg-white hover:bg-[#1A1A1A] hover:border-transparent transition-all duration-300 hover:shadow-xl hover:shadow-black/10"
                >
                  <span className="text-3xl transition-transform duration-300 group-hover/btn:scale-110 select-none">
                    🔥
                  </span>
                  <span className="text-[0.68rem] font-black tracking-[0.18em] uppercase text-[#1A1A1A] group-hover/btn:text-[#FCFBF7] transition-colors">
                    Read the Burn
                  </span>
                </Link>
              </div>
            </article>
          </div>
        )}

        {/* Bottom hairline */}
        <div
          className="mt-24 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/6 to-transparent"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
