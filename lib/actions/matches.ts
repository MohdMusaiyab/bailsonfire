'use server';

// Re-exported convenience — lets components import actions from one place
export type { RecentMatchCard, MatchesPage } from '@/lib/validations/models';

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

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { type RecentMatchCard, type MatchesPage } from '@/lib/validations/models';

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
          reactions: true,
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
    reactionsCount: row._count.reactions,
    commentsCount: row._count.comments,
    summary: row.summaries[0] ?? null,
  }));
}

/**
 * Fetches common years from the matchDate field for navigation.
 */
export async function getAvailableSeasons(): Promise<number[]> {
  const result = await prisma.match.findMany({
    select: { matchDate: true },
    orderBy: { matchDate: 'desc' },
  });
  
  const years = Array.from(new Set(result.map(r => r.matchDate.getFullYear())));
  return years.length > 0 ? years : [2026]; // default to current year
}

/**
 * Robust match fetcher for the "All Matches" hub.
 * Supports: Year filtering, Multi-team selection, and Cursor pagination.
 */
export async function getMatchesBySeason({
  year,
  teams = [],
  cursor = null,
  limit = 10
}: {
  year: number;
  teams?: string[];
  cursor?: string | null;
  limit?: number;
}): Promise<MatchesPage> {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const filters: Prisma.MatchWhereInput = {
    matchDate: {
      gte: startOfYear,
      lte: endOfYear,
    },
  };

  if (teams.length > 0) {
    filters.OR = [
      { homeTeam: { in: teams } },
      { awayTeam: { in: teams } },
    ];
  }

  const rows = await prisma.match.findMany({
    where: filters,
    take: limit + 1,
    orderBy: { matchDate: 'desc' },
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
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
        select: {
          reactions: true,
          comments: true,
        },
      },
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

  const nextCursor = rows.length > limit ? rows[limit].id : null;
  const items = rows.slice(0, limit).map((row) => ({
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
    summary: row.summaries[0] ?? null,
  }));

  return { items, nextCursor };
}

/**
 * Fetches the single most-liked match for the Wall of Shame section.
 * Orders by like count descending. If no match has any likes, returns null.
 *
 * Used by: `components/general/WallOfShame.tsx` (home page section)
 */
export async function getWallOfShame(): Promise<RecentMatchCard | null> {
  // findMany + orderBy aggregation — Prisma doesn't support orderBy _count
  // on relations directly in findFirst, so we fetch top-1 via findMany.
  const rows = await prisma.match.findMany({
    take: 1,
    orderBy: [
      { reactions: { _count: 'desc' } },
      { matchDate: 'desc' }, // tiebreaker: latest match wins
    ],
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
        select: {
          reactions: true,
          comments: true,
        },
      },
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

  if (rows.length === 0) return null;

  const row = rows[0];

  // Only return a result if at least one reaction exists
  if (row._count.reactions === 0) return null;

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
    summary: row.summaries[0] ?? null,
  };
}
