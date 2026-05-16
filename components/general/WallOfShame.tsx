// components/general/WallOfShame.tsx
// Server Component — vintage broadsheet "Wall of Shame" spotlight.

import Link from "next/link";
import { getWallOfShame } from "@/lib/actions/matches";
import { normalizeTeamName, getTeamShortName, shortenTeamNamesInSummary } from "@/lib/utils/match";
import { Flame, MessageCircle, ArrowRight, AlertTriangle } from "lucide-react";

// Team accent colours (unchanged, used for small dots/bar)
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
const teamColor = (name: string) => TEAM_COLORS[normalizeTeamName(name)] ?? "#6B7280";

export async function WallOfShame() {
  const match = await getWallOfShame();

  const dateLabel = match
    ? new Date(match.matchDate).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const loserShort = match?.loser ? getTeamShortName(match.loser) : null;
  const cleanScore = match ? shortenTeamNamesInSummary(match.scoreSummary) : "";
  const headline = match?.summary?.headline || "A PERFORMANCE BEST LEFT FORGOTTEN";
  const roastExcerpt = match?.summary?.content
    ? match.summary.content.length > 300
      ? match.summary.content.slice(0, 297).trimEnd() + "\u2026"
      : match.summary.content
    : null;

  return (
    <section
      id="wall-of-shame"
      className="relative py-20 px-5 md:px-8 bg-[#F9F6EF] overflow-hidden"
      aria-label="Wall of Shame – most reacted roast"
    >
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ── SECTION HEADER (minimal, no badges) ── */}
        <header className="mb-12">
          <div className="w-full h-0.5 bg-[#2C2B28]" />
          <div className="w-full h-px bg-[#2C2B28]/40 mt-1 mb-6" />

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-[#2C2B28] leading-[1.1]">
                Wall of Shame
              </h2>
              <p className="mt-3 text-sm sm:text-base font-serif italic text-[#6B5E4A] max-w-md">
                The one roast everyone agreed on. Picked by the mob.
              </p>
            </div>

            {/* Small vintage indicator */}
            <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-wider text-[#6B5E4A]">
              <AlertTriangle size={12} className="text-[#9B2C2C]" />
              <span>Public Verdict</span>
            </div>
          </div>

          <div className="w-full h-px bg-[#2C2B28]/20 mt-6" />
        </header>

        {/* ── CONTENT ─────────────────────────────────────────────── */}
        {match === null ? (
          /* Empty state – vintage styled */
          <div className="border-2 border-dashed border-[#2C2B28]/20 py-16 text-center bg-[#F3EFE6]">
            <p className="text-4xl mb-4 opacity-40" aria-hidden="true">
              🏆
            </p>
            <p className="text-lg font-serif italic text-[#6B5E4A] mb-2">
              &ldquo;No one has reacted yet. The silence is louder than the batting collapse.&rdquo;
            </p>
            <p className="text-[0.65rem] font-mono font-bold uppercase tracking-widest text-[#6B5E4A] mb-6">
              React on a roast to crown the first disaster
            </p>
            <Link
              href="/matches/2026"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-[#2C2B28] text-[#F9F6EF] text-[0.65rem] font-mono font-bold uppercase tracking-[0.15em] hover:bg-[#5A3A2A] transition-all shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] active:translate-x-[1px] active:translate-y-[1px]"
            >
              Browse Roasts
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          <article className="border-2 border-[#2C2B28] bg-white/40 shadow-[6px_6px_0_0_rgba(0,0,0,0.05)] relative overflow-hidden">
            {/* Top team color accent bar (loser team) */}
            {match.loser && (
              <div
                className="h-1 w-full"
                style={{ background: teamColor(match.loser) }}
                aria-hidden="true"
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* LEFT: Main content (8 cols) */}
              <div className="lg:col-span-8 p-6 md:p-10 lg:border-r border-[#2C2B28]/15">
                {/* Minimal badge – only "Most Roasted" (simplified) */}
                <div className="mb-5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2C2B28] text-[#F9F6EF] text-[0.55rem] font-mono font-bold uppercase tracking-tighter shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                    🏆 Most Roasted
                  </span>
                </div>

                {/* Matchup line */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: teamColor(match.homeTeam) }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-mono font-bold uppercase tracking-wide text-[#2C2B28]">
                      {normalizeTeamName(match.homeTeam)}
                    </span>
                  </span>
                  <span className="text-[0.6rem] font-mono font-bold text-[#2C2B28] uppercase tracking-[0.2em]">
                    vs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: teamColor(match.awayTeam) }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-mono font-bold uppercase tracking-wide text-[#2C2B28]">
                      {normalizeTeamName(match.awayTeam)}
                    </span>
                  </span>
                </div>

                {/* Score + venue/date */}
                <p className="text-[0.8rem] font-mono font-bold tracking-tight text-[#6B5E4A] uppercase mb-1">
                  {cleanScore}
                </p>
                <p className="text-[0.65rem] font-mono text-[#6B5E4A] mb-6">
                  {match.venue} &middot; {dateLabel}
                </p>

                {/* Headline */}
                <h3 className="text-3xl md:text-5xl font-serif font-bold leading-[1.1] text-[#2C2B28] mb-6 uppercase tracking-tight group-hover:text-[#5A3A2A] transition-colors">
                  {headline}
                </h3>

                {/* Roast excerpt with drop cap */}
                {roastExcerpt && (
                  <div className="pl-5 mb-8 max-w-2xl border-l-2 border-[#2C2B28]/10">
                    <p className="text-base md:text-lg font-serif text-[#3A3126] leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:text-[#2C2B28] first-letter:leading-[0.8] first-letter:pt-1">
                      {roastExcerpt}
                    </p>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-5 flex-wrap pt-5 border-t border-[#2C2B28]/10">
                  <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-mono font-bold text-[#6B5E4A]">
                    <Flame size={14} className="text-[#9B2C2C]" />
                    {match.reactionsCount.toLocaleString()} reactions
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-mono font-bold text-[#6B5E4A]">
                    <MessageCircle size={14} />
                    {match.commentsCount.toLocaleString()} comments
                  </span>
                  {match.winner && (
                    <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-mono font-bold text-[#2C2B28] uppercase tracking-wider">
                      🏆 {getTeamShortName(match.winner)} won
                    </span>
                  )}
                </div>
              </div>

              {/* RIGHT: CTA Panel (vintage dark) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 md:p-10 bg-[#2C2B28] text-[#F9F6EF]">
                <div className="text-center">
                  <p className="text-6xl mb-4 select-none opacity-90">🔥</p>
                  <p className="text-[0.6rem] font-mono font-bold uppercase tracking-[0.2em] text-[#B8A28E] mb-2">
                    The people have spoken
                  </p>
                  <p className="text-3xl md:text-4xl font-serif font-bold mb-1">
                    {match.reactionsCount.toLocaleString()}
                  </p>
                  <p className="text-[0.55rem] font-mono font-bold uppercase tracking-widest text-[#B8A28E] mb-8">
                    Total Reactions
                  </p>

                  <Link
                    href={`/match/${match.externalId}`}
                    className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-[#9B2C2C] text-[#F9F6EF] font-mono font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#5A3A2A] transition-all shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    Read the Roast
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover/btn:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Bottom rules */}
        <div className="mt-16 w-full h-px bg-[#2C2B28]/20" />
        <div className="w-full h-px bg-[#2C2B28]/10 mt-1" />
      </div>
    </section>
  );
}