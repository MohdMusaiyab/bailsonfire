// components/general/WallOfShame.tsx
// Server Component — newspaper-style "Wall of Shame" spotlight for the most-reacted roast.

import Link from "next/link";
import { getWallOfShame } from "@/lib/actions/matches";
import { normalizeTeamName, getTeamShortName, shortenTeamNamesInSummary } from "@/lib/utils/match";
import { Flame, MessageCircle, ArrowRight, AlertTriangle } from "lucide-react";

// ─── Team accent colours ────────────────────────────────────────────────────
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
    ? match.matchDate.toLocaleDateString("en-IN", {
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
      className="relative py-20 px-6 bg-[#FBFBF9] overflow-hidden"
      aria-label="Wall of Shame – most reacted roast"
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
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[0.6rem] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Hall of Shame
                </span>
                <span className="px-2 py-0.5 border border-slate-900 text-slate-900 text-[0.6rem] font-bold uppercase tracking-tighter">
                  Fan Favorite
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif leading-[1] text-slate-900 tracking-tighter uppercase">
                Wall of Shame
              </h2>
              <p className="mt-3 text-sm font-serif italic text-slate-500 max-w-md">
                The one roast everyone agreed on. Picked by the mob.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-widest text-slate-400">
              <AlertTriangle size={14} />
              <span>Public Notice</span>
            </div>
          </div>

          <div className="w-full h-px bg-slate-900/20 mt-6" />
        </header>

        {/* ── CONTENT ─────────────────────────────────────────────── */}
        {match === null ? (
          /* ── EMPTY STATE ──────────────────────────────────────── */
          <div className="border-2 border-dashed border-slate-300 py-16 text-center">
            <p className="text-4xl mb-4 select-none opacity-30" aria-hidden="true">
              🏆
            </p>
            <p className="text-lg font-serif italic text-slate-400 mb-2">
              &ldquo;No one has reacted yet. The silence is louder than the
              batting collapse.&rdquo;
            </p>
            <p className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 mb-6">
              React on a roast to crown the first disaster
            </p>
            <Link
              href="/matches/2026"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[0.65rem] font-black uppercase tracking-[0.15em] hover:bg-rose-600 transition-all shadow-[3px_3px_0px_0px_rgba(225,29,72,0.4)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              Browse Roasts
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          /* ── SPOTLIGHT — Newspaper Feature Article ───────────── */
          <article className="group border-2 border-slate-900 bg-white relative overflow-hidden">
            {/* Top loser-team color accent bar */}
            {match.loser && (
              <div
                className="h-1.5 w-full"
                style={{ background: teamColor(match.loser) }}
                aria-hidden="true"
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* ── LEFT: Main Content (8 cols) ────────────────── */}
              <div className="lg:col-span-8 p-8 md:p-10 lg:border-r-2 border-slate-900/15">
                {/* Badges row */}
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[0.55rem] font-bold uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                    🏆 Most Roasted
                  </span>
                  {loserShort && (
                    <span className="px-2 py-0.5 border border-rose-600 text-rose-600 text-[0.55rem] font-bold uppercase tracking-tighter">
                      {loserShort} caught slacking
                    </span>
                  )}
                </div>

                {/* Matchup */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: teamColor(match.homeTeam) }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-black uppercase tracking-wide text-slate-900">
                      {normalizeTeamName(match.homeTeam)}
                    </span>
                  </span>
                  <span className="text-[0.6rem] font-black text-slate-900 uppercase tracking-[0.2em]">
                    vs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: teamColor(match.awayTeam) }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-black uppercase tracking-wide text-slate-900">
                      {normalizeTeamName(match.awayTeam)}
                    </span>
                  </span>
                </div>

                {/* Score + meta */}
                <p className="text-[0.8rem] font-black tracking-tight text-slate-600 uppercase mb-1">
                  {cleanScore}
                </p>
                <p className="text-[0.65rem] font-semibold text-slate-400 mb-6">
                  {match.venue} &middot; {dateLabel}
                </p>

                {/* Headline */}
                <h3 className="text-3xl md:text-5xl font-serif leading-[1.1] text-slate-900 mb-6 uppercase group-hover:text-rose-700 transition-colors">
                  {headline}
                </h3>

                {/* Roast excerpt — drop cap */}
                {roastExcerpt && (
                  <blockquote className="border-l-2 border-slate-900/15 pl-5 mb-8 max-w-2xl">
                    <p className="text-base md:text-lg font-serif text-slate-600 leading-relaxed italic first-letter:text-5xl first-letter:font-serif first-letter:mr-2 first-letter:float-left first-letter:text-slate-900 first-letter:leading-[0.8] first-letter:pt-1">
                      {roastExcerpt}
                    </p>
                  </blockquote>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-5 flex-wrap pt-5 border-t-2 border-slate-900/10">
                  <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold text-slate-400">
                    <Flame size={14} className="text-rose-500" />
                    {match.reactionsCount.toLocaleString()} reactions
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold text-slate-400">
                    <MessageCircle size={14} />
                    {match.commentsCount.toLocaleString()} comments
                  </span>
                  {match.winner && (
                    <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-black text-emerald-700 uppercase tracking-wider">
                      🏆 {getTeamShortName(match.winner)} won
                    </span>
                  )}
                </div>
              </div>

              {/* ── RIGHT: CTA Panel (4 cols) ──────────────────── */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 md:p-10 bg-slate-900 text-white">
                <div className="text-center">
                  <p className="text-6xl mb-4 select-none">🔥</p>
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                    The people have spoken
                  </p>
                  <p className="text-3xl md:text-4xl font-serif mb-1">
                    {match.reactionsCount.toLocaleString()}
                  </p>
                  <p className="text-[0.55rem] font-black uppercase tracking-widest text-slate-500 mb-8">
                    Total Reactions
                  </p>

                  <Link
                    href={`/match/${match.externalId}`}
                    className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-rose-600 text-white font-black text-xs uppercase tracking-[0.15em] hover:bg-rose-500 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
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
        <div className="mt-16 w-full h-px bg-slate-900/10" />
        <div className="w-full h-px bg-slate-900/5 mt-1" />
      </div>
    </section>
  );
}
