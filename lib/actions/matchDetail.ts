'use server';

import { prisma } from '@/lib/prisma';
import { type MatchDetail, type CommentsPage, type CommentItem } from '@/lib/validations/models';

const COMMENTS_PER_PAGE = 10;

// ─── Match Detail ─────────────────────────────────────────────────────────────

/**
 * Fetches a single match by externalId with full detail for the roast page.
 * Returns null if not found — caller should call notFound().
 */
export async function getMatchDetail(externalId: string): Promise<MatchDetail | null> {
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
        select: { likes: true, comments: true },
      },
      summaries: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, aiModel: true },
      },
    },
  });

  if (!row) return null;

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
    likesCount: row._count.likes,
    commentsCount: row._count.comments,
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

// ─── Like Status ──────────────────────────────────────────────────────────────

/**
 * Returns true if the given user has liked the given match.
 * Called only for authenticated users.
 */
export async function getUserLikeStatus(matchId: string, userId: string): Promise<boolean> {
  const row = await prisma.like.findUnique({
    where: { userId_matchId: { userId, matchId } },
    select: { id: true },
  });
  return row !== null;
}
