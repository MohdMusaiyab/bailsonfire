'use server';

// Re-exported convenience — lets components import actions from one place
export type { RecentMatchCard, MatchesPage } from '@/lib/validations/models';

/**
 * lib/actions/matches.ts
 *
 * Server Actions for match-related data fetching.
 * All Prisma queries are wrapped in `unstable_cache` to eliminate redundant
 * DB round-trips across requests.
 *
 * Cache tag reference:
 *  'matches-home'          → busted when interactions change (home page counts)
 *  'matches-archive'       → busted when a new match/roast is added
 *  'wall-of-shame'         → busted when reactions change (most-liked can shift)
 *  'match-static-[id]'     → never busted — roast/scorecard never changes
 *  'match-interactions-[id]' → busted on every reaction/comment mutation
 */

import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { type RecentMatchCard, type MatchesPage } from '@/lib/validations/models';

// ─── Cache TTL constants ───────────────────────────────────────────────────────

/** Home page: matches added nightly. 1-hour ISR is fine. */
const HOME_REVALIDATE = 3600;

/** Archive pages: same cadence as home. */
const ARCHIVE_REVALIDATE = 3600;

/** Interaction counts shown on cards. Short TTL so they look reasonably live. */
const INTERACTION_REVALIDATE = 60;

/** Wall of Shame: recalculate every 10 minutes (likes can shift it). */
const WALL_REVALIDATE = 600;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapMatchRow(row: {
  id: string;
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  scoreSummary: string;
  matchDate: Date | string; // string after unstable_cache JSON deserialization
  venue: string;
  winner: string | null;
  loser: string | null;
  _count: { reactions: number; comments: number };
  summaries: { id: string; headline: string | null; content: string }[];
}): RecentMatchCard {
  const rawSummary = row.summaries[0];
  return {
    id: row.id,
    externalId: row.externalId,
    homeTeam: row.homeTeam,
    awayTeam: row.awayTeam,
    scoreSummary: row.scoreSummary,
    // Always reconstruct a real Date — unstable_cache serializes Date → string
    matchDate: new Date(row.matchDate),
    venue: row.venue,
    winner: row.winner,
    loser: row.loser,
    reactionsCount: row._count.reactions,
    commentsCount: row._count.comments,
    summary: rawSummary
      ? { ...rawSummary, headline: rawSummary.headline ?? '' }
      : null,
  };
}

// ─── getRecentMatches ──────────────────────────────────────────────────────────

/**
 * Fetches the `limit` most recent completed matches for the home page cards.
 * Cached with a 1-hour ISR so new nightly matches surface automatically.
 * Busted immediately by `revalidateTag('matches-home')` when a user interacts.
 */
export async function getRecentMatches(limit = 3): Promise<RecentMatchCard[]> {
  return unstable_cache(
    async () => {
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
              headline: true,
              content: true,
            },
          },
        },
      });

      return rows.map(mapMatchRow);
    },
    // Cache key — include limit so different call sites get separate entries
    [`recent-matches-${limit}`],
    {
      tags: ['matches-home'],
      revalidate: HOME_REVALIDATE,
    }
  )();
}

// ─── getAvailableSeasons ───────────────────────────────────────────────────────

/**
 * Fetches distinct years from match dates for navigation.
 * New seasons are extremely rare — cache for a day.
 */
export const getAvailableSeasons = unstable_cache(
  async (): Promise<number[]> => {
    const result = await prisma.match.findMany({
      select: { matchDate: true },
      orderBy: { matchDate: 'desc' },
    });

    const years = Array.from(new Set(result.map((r) => r.matchDate.getFullYear())));
    return years.length > 0 ? years : [2026];
  },
  ['available-seasons'],
  {
    tags: ['matches-archive'],
    revalidate: 86400, // 24 hours
  }
);

// ─── getMatchesBySeason ────────────────────────────────────────────────────────

/**
 * Robust match fetcher for the season archive hub.
 * Supports year filtering, multi-team selection, and cursor pagination.
 *
 * NOTE: Because this is cursor-paginated and accepts team filters, caching the
 * full result set is impractical. Instead we cache per (year, page) key.
 * The first page of each season (most common hit) benefits from the cache.
 */
export async function getMatchesBySeason({
  year,
  teams = [],
  cursor = null,
  limit = 10,
}: {
  year: number;
  teams?: string[];
  cursor?: string | null;
  limit?: number;
}): Promise<MatchesPage> {
  // Only cache when no team filter and first page — this is the common path
  const isDefaultQuery = teams.length === 0 && cursor === null;

  const fetchFn = async (): Promise<MatchesPage> => {
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
            headline: true,
            content: true,
          },
        },
      },
    });

    const nextCursor = rows.length > limit ? rows[limit].id : null;
    const items = rows.slice(0, limit).map(mapMatchRow);
    return { items, nextCursor };
  };

  if (isDefaultQuery) {
    return unstable_cache(fetchFn, [`matches-season-${year}-p1`], {
      tags: ['matches-archive'],
      revalidate: ARCHIVE_REVALIDATE,
    })();
  }

  // Filtered/paginated queries bypass cache — always fresh
  return fetchFn();
}

// ─── getWallOfShame ────────────────────────────────────────────────────────────

/**
 * Fetches the single most-liked match for the Wall of Shame section.
 * Cached for 10 minutes since any like could theoretically change the winner.
 * Busted immediately by `revalidateTag('wall-of-shame')` on every reaction.
 */
export const getWallOfShame = unstable_cache(
  async (): Promise<RecentMatchCard | null> => {
    const rows = await prisma.match.findMany({
      take: 1,
      orderBy: [
        { reactions: { _count: 'desc' } },
        { matchDate: 'desc' },
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
            headline: true,
            content: true,
          },
        },
      },
    });

    if (rows.length === 0) return null;

    const row = rows[0];
    if (row._count.reactions === 0) return null;

    return mapMatchRow(row);
  },
  ['wall-of-shame'],
  {
    tags: ['wall-of-shame'],
    revalidate: WALL_REVALIDATE,
  }
);

// ─── getNewspaperHeroData ──────────────────────────────────────────────────────

/**
 * Fetches data required for the Newspaper Hero section:
 * - Latest roast (lead story)
 * - Recent match results (ticker)
 * - Most-reacted matches (trending scandals)
 * - Total match count
 *
 * Cached for 1 hour. Busted by 'matches-home' on interactions so counts update.
 */
export const getNewspaperHeroData = unstable_cache(
  async () => {
    const latestMatch = await prisma.match.findFirst({
      orderBy: { matchDate: 'desc' },
      select: {
        id: true,
        externalId: true,
        homeTeam: true,
        awayTeam: true,
        scoreSummary: true,
        matchDate: true,
        venue: true,
        summaries: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            headline: true,
            content: true,
          },
        },
      },
    });

    const breakingNews = await prisma.match.findMany({
      take: 5,
      orderBy: { matchDate: 'desc' },
      select: {
        winner: true,
        loser: true,
        scoreSummary: true,
        externalId: true,
      },
    });

    const trendingScandals = await prisma.match.findMany({
      take: 3,
      orderBy: [
        { reactions: { _count: 'desc' } },
        { matchDate: 'desc' },
      ],
      select: {
        id: true,
        externalId: true,
        homeTeam: true,
        awayTeam: true,
        summaries: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            headline: true,
            content: true,
          },
        },
      },
    });

    const totalMatches = await prisma.match.count();

    return {
      latestMatch,
      breakingNews,
      trendingScandals,
      totalMatches,
    };
  },
  ['newspaper-hero'],
  {
    tags: ['matches-home'],
    revalidate: HOME_REVALIDATE,
  }
);
