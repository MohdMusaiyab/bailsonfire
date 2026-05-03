/**
 * app/match/[externalId]/page.tsx
 *
 * The Match Roast Detail Page.
 * Route: /match/lsg_rcb_2026-04-15
 *
 * Server Component — fetches all data server-side in parallel for:
 * - SEO (full HTML in first response, no JS hydration required for content)
 * - Speed (three DB queries run concurrently with Promise.all)
 *
 * Auth-aware without being an auth wall:
 * - Everyone sees the roast, like count, and all comments.
 * - Logged-in users get an interactive like button and can post/delete comments.
 * - Guests get a disabled-but-visible like count and a "Sign in to comment" CTA.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { type Metadata } from 'next';
import { auth } from '@/auth';
import { getMatchDetail, getComments } from '@/lib/actions/matchDetail';
import { ReactionButton } from '@/components/match/ReactionButton';
import { CommentsSection } from '@/components/match/CommentsSection';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ externalId: string }>;
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { externalId } = await params;
  const match = await getMatchDetail(externalId);

  if (!match) {
    return { title: 'Match Not Found | BailsOnFire' };
  }

  const description =
    match.summary?.content.slice(0, 155).trimEnd() ??
    `${match.homeTeam} vs ${match.awayTeam} — IPL Match Roast on BailsOnFire`;

  return {
    title: `${match.homeTeam} vs ${match.awayTeam} · ${match.scoreSummary.slice(0, 40)} | BailsOnFire`,
    description,
    openGraph: {
      title: `${match.homeTeam} vs ${match.awayTeam} — Roast`,
      description,
      type: 'article',
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
  const [commentsPage] = await Promise.all([
    getComments(match.id, null),
  ]);

  const userReaction = match.userReaction;

  // Format date for display
  const dateLabel = match.matchDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#FCFBF7]">
      {/* Architectural vertical lines — mirror homepage */}
      <div className="fixed left-[5%] top-0 bottom-0 w-px bg-[#1A1A1A]/4 hidden xl:block pointer-events-none" aria-hidden="true" />
      <div className="fixed right-[5%] top-0 bottom-0 w-px bg-[#1A1A1A]/4 hidden xl:block pointer-events-none" aria-hidden="true" />

      <main className="mx-auto max-w-3xl px-6 md:px-12 py-16">

        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <nav className="mb-12" aria-label="Breadcrumb">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-widest text-[#1A1A1A]/35 hover:text-[#1A1A1A] transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6H3M5 2L1 6l4 4" />
            </svg>
            Recent Matches
          </Link>
        </nav>

        {/* ── Match Header ───────────────────────────────────────────── */}
        <header className="mb-12">
          {/* Overline */}
          <p className="mb-3 text-[0.68rem] font-black tracking-[0.22em] uppercase text-[#1A1A1A]/30">
            IPL 2026 · Match Roast
          </p>

          {/* Teams headline */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-[#1A1A1A] mb-6">
            {match.homeTeam}
            <span className="block text-2xl md:text-3xl font-light italic text-[#1A1A1A]/40 my-2">vs</span>
            {match.awayTeam}
          </h1>

          {/* Date, venue, score */}
          <div className="flex flex-col gap-2.5 mb-6">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#1A1A1A]/35">
              {dateLabel}
            </p>
            <p className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-[#1A1A1A]/40">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" />
                <circle cx="12" cy="8" r="2" fill="currentColor" strokeWidth={0} />
              </svg>
              {match.venue}
            </p>
            <p className="text-lg font-black tracking-tight text-[#1A1A1A]">
              {match.scoreSummary}
            </p>
          </div>

          {/* Winner badge */}
          {match.winner && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[0.72rem] font-black uppercase tracking-wide">
              <span aria-hidden="true">🏆</span>
              {match.winner} won
            </div>
          )}
        </header>

        {/* Section divider */}
        <div className="h-px mb-12 bg-gradient-to-r from-transparent via-[#1A1A1A]/8 to-transparent" aria-hidden="true" />

        {/* ── Full Roast ─────────────────────────────────────────────── */}
        <section aria-label="AI Roast" className="mb-12">
          <p className="mb-4 text-[0.68rem] font-black tracking-[0.22em] uppercase text-[#1A1A1A]/30">
            The Roast
          </p>

          {match.summary ? (
            <>
              <div className="prose prose-neutral max-w-none">
                {match.summary.content.split('\n').map((para, i) =>
                  para.trim() ? (
                    <p key={i} className="text-[1rem] leading-[1.8] text-[#1A1A1A]/75 mb-5">
                      {para}
                    </p>
                  ) : null
                )}
              </div>
              <p className="mt-6 text-[0.65rem] font-bold uppercase tracking-widest text-[#1A1A1A]/20">
                Generated by {match.summary.aiModel}
              </p>
            </>
          ) : (
            <div className="py-12 text-center bg-white border border-[#1A1A1A]/5 rounded-2xl">
              <p className="text-sm font-bold text-[#1A1A1A]/30 uppercase tracking-widest">
                Roast being generated…
              </p>
            </div>
          )}
        </section>

        {/* Section divider */}
        <div className="h-px mb-10 bg-gradient-to-r from-transparent via-[#1A1A1A]/8 to-transparent" aria-hidden="true" />

        {/* ── Engagement Bar: Reactions + share ──────────────────────────── */}
        <div className="flex items-center gap-4 mb-2">
          <ReactionButton
            matchId={match.id}
            initialCount={match.reactionsCount}
            initialReaction={userReaction}
            isAuthenticated={userId !== null}
            isVerified={isVerified}
          />

          {/* Static comment count indicator */}
          <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#1A1A1A]/40 bg-white border border-[#1A1A1A]/6 rounded-xl">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
        <div className="mt-20 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/5 to-transparent" aria-hidden="true" />
      </main>
    </div>
  );
}
