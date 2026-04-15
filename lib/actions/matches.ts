'use server';

/**
 * lib/actions/matches.ts
 *
 * Server Actions for match-related data fetching.
 * All functions run server-side only — never bundled to the client.
 *
 * Why a dedicated actions file instead of querying in the component?
 * - Keeps DB logic out of component files (single responsibility).
 * - Can be imported by both Server Components (direct call) and
 *   Client Components (via useTransition / useActionState).
 * - Return types are explicitly constrained — no raw Prisma objects
 *   ever reach the client boundary.
 */

import { prisma } from '@/lib/prisma';
import { type RecentMatchCard } from '@/lib/validations/models';

/**
 * Fetches the `limit` most recent completed matches, ordered by match date.
 * Includes total like count, total comment count, and the first summary (roast).
 *
 * Used by: `components/general/RecentMatches.tsx` (home page section)
 *
 * @param limit  How many matches to return. Defaults to 3.
 * @returns      Array of `RecentMatchCard` objects, newest first.
 */
export async function getRecentMatches(limit = 3): Promise<RecentMatchCard[]> {
  const rows = await prisma.match.findMany({
    take: limit,
    orderBy: { matchDate: 'desc' },
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
      // Aggregate counts — one DB round-trip, no N+1
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      // Only the first summary (the roast) — we don't need all fields
      summaries: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
        },
      },
    },
  });

  // Map to a clean, UI-facing shape — Prisma internals (_count, relation
  // arrays) are flattened so the component has zero knowledge of Prisma.
  return rows.map((row) => ({
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
  }));
}
