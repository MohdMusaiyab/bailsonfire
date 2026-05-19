'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  type MatchDetail,
  type CommentsPage,
  type CommentItem,
  type ReactionType,
} from '@/lib/validations/models';

import { shortenTeamNamesInSummary } from '@/lib/utils/match';

const COMMENTS_PER_PAGE = 10;

// ─── Match Static Data (permanent cache) ──────────────────────────────────────

/**
 * Fetches the static, immutable parts of a match: scorecard, roast, teams.
 * Uses a two-tier caching strategy:
 *
 * - NO roast yet (summary = null): short 5-minute TTL so the page picks up
 *   the roast quickly after addroast.ts runs.
 * - Roast exists: 24-hour TTL. The roast/scorecard never changes once written,
 *   so a long cache is safe and eliminates DB queries for popular match pages.
 *
 * Both tiers share the same `match-static-[externalId]` tag so they can be
 * manually busted if needed (e.g., if a roast is corrected).
 */
async function getMatchStaticData(externalId: string) {
  // ── Step 1: Fetch with short TTL (covers the "no roast yet" case) ──────────
  const SHORT_TTL = 300;   // 5 minutes
  const LONG_TTL  = 86400; // 24 hours — safe once roast is written

  const rawFetch = unstable_cache(
    async () => {
      return prisma.match.findUnique({
        where: { externalId },
        select: {
          id: true,
          externalId: true,
          homeTeam: true,
          awayTeam: true,
          scoreSummary: true,
          matchDate: true,
          venue: true,
          winner: true,
          loser: true,
          summaries: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { id: true, headline: true, content: true, aiModel: true },
          },
        },
      });
    },
    [`match-static-${externalId}`],
    {
      tags: [`match-static-${externalId}`, 'matches-archive'],
      revalidate: SHORT_TTL,
    }
  );

  const data = await rawFetch();

  // ── Step 2: If roast is present, promote to long-lived cache ───────────────
  // This prevents a 5-minute DB hit on every popular match page that already
  // has a roast. The long-cache entry is keyed separately so it doesn't
  // interfere with the short-cache entry still being used for roast-less pages.
  if (data && data.summaries.length > 0) {
    return unstable_cache(
      async () => data,
      [`match-static-roasted-${externalId}`],
      {
        tags: [`match-static-${externalId}`, 'matches-archive'],
        revalidate: LONG_TTL,
      }
    )();
  }

  return data ?? null;
}

// ─── Match Interaction Counts (short cache) ────────────────────────────────────

/**
 * Fetches live reaction/comment counts for a match.
 * Cached briefly (60s ISR) so counts feel reasonably current on page load.
 * Busted immediately by `revalidateTag('match-interactions-[id]')` after
 * any toggleReaction / postComment / deleteComment action.
 */
async function getMatchInteractionCounts(matchId: string) {
  return unstable_cache(
    async () => {
      const [countRow, breakdownRows] = await Promise.all([
        prisma.match.findUnique({
          where: { id: matchId },
          select: {
            _count: { select: { reactions: true, comments: true } },
          },
        }),
        prisma.reaction.groupBy({
          by: ['type'],
          where: { matchId },
          _count: true,
        }),
      ]);

      const reactionBreakdown: Record<ReactionType, number> = {
        FIRE: 0,
        LOVE: 0,
        AVERAGE: 0,
        TRASH: 0,
      };

      breakdownRows.forEach((r) => {
        reactionBreakdown[r.type] = r._count;
      });

      return {
        reactionsCount: countRow?._count.reactions ?? 0,
        commentsCount: countRow?._count.comments ?? 0,
        reactionBreakdown,
      };
    },
    [`match-interactions-${matchId}`],
    {
      tags: [`match-interactions-${matchId}`],
      revalidate: 60, // 1-minute ISR fallback; on-demand bust on interaction
    }
  )();
}

// ─── getMatchDetail (public) ───────────────────────────────────────────────────

/**
 * Assembles a full MatchDetail for the roast page.
 * Combines:
 *  - Permanent-cached static data (match + roast)
 *  - Short-cached interaction counts
 *  - Uncached user-specific data (userReaction) — always fresh per session
 *
 * Returns null if not found — caller should call notFound().
 */
export async function getMatchDetail(
  externalId: string,
  userId?: string
): Promise<MatchDetail | null> {
  const staticData = await getMatchStaticData(externalId);
  if (!staticData) return null;

  const { id: matchId } = staticData;

  // Run interaction counts and user-specific reaction in parallel
  const [interactions, userReactionRow] = await Promise.all([
    getMatchInteractionCounts(matchId),
    // Per-user data is NEVER cached — every session must see their own state
    userId
      ? prisma.reaction.findUnique({
          where: { userId_matchId: { userId, matchId } },
          select: { type: true },
        })
      : Promise.resolve(null),
  ]);

  return {
    id: matchId,
    externalId: staticData.externalId,
    homeTeam: staticData.homeTeam,
    awayTeam: staticData.awayTeam,
    scoreSummary: shortenTeamNamesInSummary(staticData.scoreSummary),
    // Reconstruct real Date — unstable_cache deserializes Date fields as strings
    matchDate: new Date(staticData.matchDate),
    venue: staticData.venue,
    winner: staticData.winner,
    loser: staticData.loser,
    reactionsCount: interactions.reactionsCount,
    commentsCount: interactions.commentsCount,
    userReaction: userReactionRow?.type ?? null,
    reactionBreakdown: interactions.reactionBreakdown,
    summary: staticData.summaries[0] ?? null,
  };
}

// ─── Comments ─────────────────────────────────────────────────────────────────

/**
 * Cursor-paginated comments. First page is cached briefly (60s).
 * Subsequent pages (cursor !== null) bypass cache — less common, always fresh.
 * Busted by `revalidateTag('match-interactions-[matchId]')` on comment mutation.
 */
export async function getComments(
  matchId: string,
  cursor: string | null
): Promise<CommentsPage> {
  const fetchFn = async (): Promise<CommentsPage> => {
    const rows = await prisma.comment.findMany({
      where: {
        matchId,
        ...(cursor !== null && {
          createdAt: { lt: new Date(cursor) },
        }),
      },
      take: COMMENTS_PER_PAGE + 1,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    const hasMore = rows.length > COMMENTS_PER_PAGE;
    const items: CommentItem[] = rows.slice(0, COMMENTS_PER_PAGE);

    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].createdAt.toISOString() : null,
    };
  };

  // Only cache the first page — it's the most frequently loaded
  if (cursor === null) {
    return unstable_cache(fetchFn, [`comments-${matchId}-p1`], {
      tags: [`match-interactions-${matchId}`],
      revalidate: 60,
    })();
  }

  // Paginated requests bypass cache
  return fetchFn();
}

// ─── getUserReaction ──────────────────────────────────────────────────────────

/**
 * Returns the reaction type if the given user has reacted.
 * NEVER cached — must always reflect the current user's session state.
 */
export async function getUserReaction(
  matchId: string,
  userId: string
): Promise<ReactionType | null> {
  const row = await prisma.reaction.findUnique({
    where: { userId_matchId: { userId, matchId } },
    select: { type: true },
  });
  return row?.type ?? null;
}
