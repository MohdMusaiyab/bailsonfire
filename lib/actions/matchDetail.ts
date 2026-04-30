'use server';

import { prisma } from '@/lib/prisma';
import { type MatchDetail, type CommentsPage, type CommentItem, type ReactionType } from '@/lib/validations/models';

const COMMENTS_PER_PAGE = 10;

// ─── Match Detail ─────────────────────────────────────────────────────────────

/**
 * Fetches a single match by externalId with full detail for the roast page.
 * Returns null if not found — caller should call notFound().
 */
export async function getMatchDetail(
  externalId: string,
  userId?: string
): Promise<MatchDetail | null> {
  const row = await prisma.match.findUnique({
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
      _count: {
        select: { reactions: true, comments: true },
      },
      summaries: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, aiModel: true },
      },
      // Always select reactions, but filter by userId (fallback to empty string if guest)
      // This ensures the property exists on the 'row' type consistently.
      reactions: {
        where: { userId: userId ?? '' },
        select: { type: true },
      },
    },
  });

  if (!row) return null;

  // For the breakdown, we perform a separate aggregation
  const breakdownRows = await prisma.reaction.groupBy({
    by: ['type'],
    where: { matchId: row.id },
    _count: true,
  });

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
    id: row.id,
    externalId: row.externalId,
    homeTeam: row.homeTeam,
    awayTeam: row.awayTeam,
    scoreSummary: row.scoreSummary,
    matchDate: row.matchDate,
    venue: row.venue,
    winner: row.winner,
    loser: row.loser,
    reactionsCount: row._count.reactions,
    commentsCount: row._count.comments,
    userReaction: row.reactions[0]?.type ?? null,
    reactionBreakdown,
    summary: row.summaries[0] ?? null,
  };
}

// ─── Comments ─────────────────────────────────────────────────────────────────

/**
 * Cursor-paginated comments for a match.
 * Newest first. Pass cursor = null for the first page.
 * cursor is the createdAt ISO string of the last item from the previous page.
 */
export async function getComments(
  matchId: string,
  cursor: string | null,
): Promise<CommentsPage> {
  const rows = await prisma.comment.findMany({
    where: {
      matchId,
      // If cursor is set, fetch comments older than the cursor record
      ...(cursor !== null && {
        createdAt: { lt: new Date(cursor) },
      }),
    },
    take: COMMENTS_PER_PAGE + 1, // fetch one extra to detect if there's a next page
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
}

// ─── Reaction Status ──────────────────────────────────────────────────────────

/**
 * Returns the reaction type if the given user has reacted to the given match.
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
