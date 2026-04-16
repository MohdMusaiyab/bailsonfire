// components/general/RecentMatches.tsx
// Pure Server Component — no client JS needed, pure Tailwind styling.

import Link from "next/link";
import { getRecentMatches } from "@/lib/actions/matches";
import { type RecentMatchCard } from "@/lib/validations/models";

// ─── Team accent colours ────────────────────────────────────────────────────
// Used only as a subtle jewel dot — never as dominant background colour.
const TEAM_COLORS: Record<string, string> = {
  "Mumbai Indians": "#004BA0",
  "Chennai Super Kings": "#C8A800",  // darkened from raw yellow for legibility
  "Royal Challengers Bengaluru": "#CC1020",
  "Kolkata Knight Riders": "#552791",
  "Delhi Capitals": "#0078BC",
  "Sunrisers Hyderabad": "#D4881E",  // darkened for contrast
  "Rajasthan Royals": "#EA1A85",
  "Punjab Kings": "#C41020",
  "Lucknow Super Giants": "#3B82F6",
  "Gujarat Titans": "#1C1C1C",
};

const teamColor = (name: string): string => TEAM_COLORS[name] ?? "#6B7280";

// ─── TeamTag ─────────────────────────────────────────────────────────────────

function TeamTag({ name }: { name: string }) {
  const color = teamColor(name);
  return (
    <span className="inline-flex items-center gap-2 text-[0.9rem] font-bold tracking-tight text-[#1A1A1A]">
      {/* jewel indicator — team colour as a 8px dot */}
      <span
        className="shrink-0 inline-block w-2 h-2 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />
      {name}
    </span>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────

function MatchCard({ match, index }: { match: RecentMatchCard; index: number }) {
  const dateLabel = match.matchDate.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const roastTeaser =
    match.summary !== null
      ? match.summary.content.length > 160
        ? match.summary.content.slice(0, 157).trimEnd() + "\u2026"
        : match.summary.content
      : null;

  // Stagger via inline style — works without JS or CSS animation classes.
  const staggerDelay = `${index * 80}ms`;

  return (
    <article
      className="group relative flex flex-col h-full"
      style={{ animationDelay: staggerDelay }}
    >
      {/*
       * CARD SHELL
       * Off-white base with a barely-visible border, matching the Hero's
       * architectural language. Hover lifts and adds a slightly deeper shadow.
       */}
      <div className="flex flex-col flex-1 p-7 bg-white border border-[#1A1A1A]/[0.06] rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.07),0_16px_40px_rgba(0,0,0,0.08)]">

        {/* ── HEADER: teams + date ──────────────────────────────── */}
        <header className="mb-5">
          {/* Teams stacked vertically, separated by a thin rule */}
          <div className="flex flex-col gap-2.5">
            <TeamTag name={match.homeTeam} />
            {/* micro-divider between the two team names */}
            <div className="flex items-center gap-2 pl-[18px]">
              <div className="w-5 h-px bg-[#1A1A1A]/10" />
              <span className="text-[0.6rem] font-black tracking-[0.2em] uppercase text-[#1A1A1A]/30">
                vs
              </span>
            </div>
            <TeamTag name={match.awayTeam} />
          </div>

          {/* date — written small, architectural */}
          <time
            className="block mt-4 text-[0.68rem] font-bold tracking-[0.18em] uppercase text-[#1A1A1A]/35"
            dateTime={match.matchDate.toISOString()}
          >
            {dateLabel}
          </time>
        </header>

        {/* full-width separator — same as Hero's decorative lines */}
        <div className="mb-5 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/8 to-transparent" />

        {/* ── BODY: score, venue, winner ───────────────────────── */}
        <div className="flex flex-col gap-3 mb-5">
          {/* Score — the dominant text on the card */}
          <p className="text-base font-black tracking-tight leading-snug text-[#1A1A1A]">
            {match.scoreSummary}
          </p>

          {/* Venue — muted, with a tiny pin icon */}
          <p className="flex items-start gap-1.5 text-[0.75rem] font-semibold text-[#1A1A1A]/40 leading-relaxed">
            <svg
              className="w-3 h-3 mt-px shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z"
              />
              <circle cx="12" cy="8" r="2" fill="currentColor" strokeWidth={0} />
            </svg>
            {match.venue}
          </p>

          {/* Winner badge — subtle green pill */}
          {match.winner !== null && (
            <div className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[0.7rem] font-black tracking-wide uppercase">
              <span aria-hidden="true">🏆</span>
              {match.winner}
            </div>
          )}
        </div>

        {/* ── ROAST TEASER  ─────────────────────────────────────── */}
        {roastTeaser !== null && (
          <div className="flex-1 mb-6">
            <blockquote className="relative pl-3.5 border-l-2 border-[#1A1A1A]/10">
              <p className="text-[0.82rem] leading-relaxed text-[#1A1A1A]/55 italic m-0">
                {roastTeaser}
              </p>
            </blockquote>
          </div>
        )}

        {/* spacer when no teaser */}
        {roastTeaser === null && <div className="flex-1" />}

        {/* ── FOOTER: counts + CTA ─────────────────────────────── */}
        <footer className="flex items-center justify-between pt-5 border-t border-[#1A1A1A]/5">
          {/* engagement counts */}
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-[#1A1A1A]/35"
              aria-label={`${match.likesCount} likes`}
            >
              <span aria-hidden="true">👍</span>
              {match.likesCount}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-[#1A1A1A]/35"
              aria-label={`${match.commentsCount} comments`}
            >
              <span aria-hidden="true">💬</span>
              {match.commentsCount}
            </span>
          </div>

          {/*
           * CTA — mirrors the Hero's primary button but scaled down.
           * Solid charcoal on hover for a premium "press" feel.
           */}
          <Link
            href={`/match/${match.externalId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[0.75rem] font-black tracking-wide uppercase text-[#1A1A1A] border border-[#1A1A1A]/12 rounded-lg transition-all duration-200 hover:bg-[#1A1A1A] hover:text-[#FCFBF7] hover:border-[#1A1A1A]"
            aria-label={`Read full roast for ${match.homeTeam} vs ${match.awayTeam}`}
          >
            Full Roast
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 12 12"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2 6h8M6 2l4 4-4 4"
              />
            </svg>
          </Link>
        </footer>
      </div>
    </article>
  );
}

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

        {/* Bottom hairline — same as Hero's bottom fade language */}
        <div className="mt-20 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/6 to-transparent" aria-hidden="true" />
      </div>
    </section>
  );
}
