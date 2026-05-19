/**
 * app/match/[externalId]/page.tsx
 *
 * The Match Roast Detail Page.
 * Route: /match/lsg_rcb_2026-04-15
 *
 * Server Component — fetches all data server-side in parallel for:
 * - SEO (full HTML in first response, no JS hydration required for content)
 * - Speed (three DB queries run concurrently with Promise.all)
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { type Metadata } from "next";
import { auth } from "@/auth";
import { getMatchDetail, getComments } from "@/lib/actions/matchDetail";
import { ReactionButton } from "@/components/match/ReactionButton";
import { CommentsSection } from "@/components/match/CommentsSection";
import { ShareButton } from "@/components/match/ShareButton";
import { env } from "@/lib/env";

// Cache strategy (set inside matchDetail.ts via unstable_cache):
//   - Match has NO roast yet   → 5-min TTL  (picks up roast within 5 min after addroast.ts runs)
//   - Match HAS a roast        → 24-hr TTL  (roast never changes; avoids repeated DB hits)
//   - Interaction counts       → 60-s TTL   (busted on-demand via revalidateTag on every action)
//   - User reaction state      → never cached (always fresh per session)
// This route-level revalidate acts as a safety net for edge cases.
export const revalidate = 60;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ externalId: string }>;
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { externalId } = await params;
  const match = await getMatchDetail(externalId);

  if (!match) {
    return { title: "Match Not Found | BailsOnFire" };
  }

  const description =
    match.summary?.content.slice(0, 160).trimEnd() ??
    `${match.homeTeam} vs ${match.awayTeam} — IPL Match Roast on BailsOnFire`;

  const title = `${match.homeTeam} vs ${match.awayTeam} · Roast | BailsOnFire`;
  const url = `${env.NEXT_PUBLIC_APP_URL}/match/${externalId}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "BailsOnFire",
      images: [
        {
          url: `/match/${externalId}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Roast for ${match.homeTeam} vs ${match.awayTeam}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/match/${externalId}/opengraph-image`],
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function MatchRoastPage({ params }: PageProps) {
  const { externalId } = await params;

  // 1. Resolve session — reads from signed cookie, no DB hit
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isVerified = session?.user?.emailVerified ? true : false;

  // 2. Fetch match — needed to get the matchId for subsequent queries
  // We pass userId to getMatchDetail so it can fetch the user's reaction in one query
  const match = await getMatchDetail(externalId, userId ?? undefined);
  if (!match) notFound();

  // 3. Fetch comments + reaction status in parallel
  const [commentsPage] = await Promise.all([getComments(match.id, null)]);

  const userReaction = match.userReaction;

  // Format date for display
  const dateLabel = match.matchDate.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const shareUrl = `${env.NEXT_PUBLIC_APP_URL}/match/${externalId}`;
  const matchYear = match.matchDate.getFullYear();

  return (
    <div className="min-h-screen bg-[#F9F6EF] relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply"
        aria-hidden="true"
      />
      {/* Architectural vertical lines — mirror homepage */}
      <div
        className="fixed left-[5%] top-0 bottom-0 w-0.5 bg-[#2C2B28] hidden xl:block pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed right-[5%] top-0 bottom-0 w-0.5 bg-[#2C2B28] hidden xl:block pointer-events-none"
        aria-hidden="true"
      />

      <main className="mx-auto max-w-3xl px-6 md:px-12 py-16 relative z-10">
        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <nav className="mb-12" aria-label="Breadcrumb">
          <Link
            href={`/matches/${matchYear}`}
            className="inline-flex items-center gap-1.5 text-[0.72rem] font-mono font-bold uppercase tracking-widest text-[#6B5E4A] hover:text-[#9B2C2C] transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 12 12"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 6H3M5 2L1 6l4 4"
              />
            </svg>
            {matchYear} Season
          </Link>
        </nav>

        {/* ── Match Header ───────────────────────────────────────────── */}
        <header className="mb-12">
          {/* Overline */}
          <p className="mb-3 text-[0.68rem] font-mono font-bold tracking-[0.22em] uppercase text-[#6B5E4A]">
            {matchYear} · Match Roast
          </p>

          {/* Teams headline */}
          <h1 className="text-4xl md:text-6xl font-black font-serif uppercase tracking-tighter leading-none text-[#2C2B28] mb-6">
            {match.homeTeam}
            <span className="block text-2xl md:text-3xl font-mono font-bold text-[#6B5E4A] my-2">
              vs
            </span>
            {match.awayTeam}
          </h1>

          {/* Date, venue, score */}
          <div className="flex flex-col gap-2.5 mb-6">
            <p className="text-[0.75rem] font-mono font-bold uppercase tracking-[0.18em] text-[#6B5E4A]">
              {dateLabel}
            </p>
            <p className="flex items-center gap-1.5 text-[0.75rem] font-mono font-bold tracking-widest uppercase text-[#6B5E4A]">
              <svg
                className="w-3 h-3"
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
                <circle
                  cx="12"
                  cy="8"
                  r="2"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </svg>
              {match.venue}
            </p>
            <p className="text-lg font-black font-serif uppercase tracking-tight text-[#2C2B28] mt-2">
              {match.scoreSummary}
            </p>
          </div>

          <div className="flex items-center justify-between mt-8 border-t-2 border-[#2C2B28] pt-6">
            {/* Winner badge */}
            <div className="h-8 flex items-center">
              {match.winner && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2C2B28] text-[#F9F6EF] text-[0.65rem] font-mono font-bold uppercase tracking-widest shadow-[3px_3px_0_0_rgba(0,0,0,0.3)]">
                  WINNER: {match.winner}
                </div>
              )}
            </div>

            {/* Share Button Integrated Here */}
            <ShareButton
              title={`${match.homeTeam} vs ${match.awayTeam} Roast`}
              text={`Check out this brutal AI roast of the ${match.homeTeam} vs ${match.awayTeam} match on Bails On Fire!`}
              url={shareUrl}
              externalId={externalId}
            />
          </div>
        </header>

        {/* Section divider */}
        <div
          className="border-b-2 border-dashed border-[#2C2B28] mb-12"
          aria-hidden="true"
        />

        {/* ── Full Roast ─────────────────────────────────────────────── */}
        <section aria-label="AI Roast" className="mb-12">
          <p className="mb-4 text-[0.68rem] font-mono font-bold tracking-[0.22em] uppercase text-[#6B5E4A]">
            The Roast
          </p>

          {match.summary ? (
            <div className="pl-6 border-l-4 border-[#9B2C2C]">
              <div className="prose prose-neutral max-w-none">
                {match.summary.content.split("\n").map((para, i) =>
                  para.trim() ? (
                    <p
                      key={i}
                      className="text-[1.1rem] md:text-[1.25rem] font-serif leading-[1.8] text-[#3A3126] mb-6"
                    >
                      {para}
                    </p>
                  ) : null,
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center border-y-2 border-dashed border-[#2C2B28]">
              <p className="text-sm font-mono font-bold text-[#6B5E4A] uppercase tracking-widest">
                [Awaiting Publisher]
              </p>
            </div>
          )}
        </section>

        {/* Section divider */}
        <div
          className="border-b-2 border-dashed border-[#2C2B28] mb-10"
          aria-hidden="true"
        />

        {/* ── Engagement Bar: Reactions ──────────────────────────── */}
        <div className="flex items-center gap-4 mb-2">
          <ReactionButton
            matchId={match.id}
            initialCount={match.reactionsCount}
            initialReaction={userReaction}
            isAuthenticated={userId !== null}
            isVerified={isVerified}
          />

          {/* Static comment count indicator */}
          <span className="inline-flex items-center gap-2 px-4 py-2 text-[0.8rem] font-mono font-bold text-[#2C2B28] bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[3px_3px_0_0_rgba(0,0,0,0.2)]">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {match.commentsCount}
          </span>
        </div>

        {/* ── Comments ───────────────────────────────────────────────── */}
        <CommentsSection
          matchId={match.id}
          initialPage={commentsPage}
          currentUserId={userId}
          currentUserName={session?.user?.name ?? null}
          isVerified={isVerified}
        />

        {/* Bottom hairline */}
        <div className="mt-20 border-b-2 border-[#2C2B28]" aria-hidden="true" />
      </main>
    </div>
  );
}
