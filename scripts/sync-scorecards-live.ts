/**
 * scripts/sync-scorecards-live.ts
 *
 * Retroactively fetches and saves scorecards from CricAPI for any
 * 2026 IPL matches in the DB that currently have a null scorecard.
 *
 * Use this when:
 *  - ingest-live.ts inserted a match but the scorecard API was unavailable
 *  - You want to re-hydrate scorecards after fixing the mapping logic
 *
 * Run: npx tsx scripts/sync-scorecards-live.ts
 */

import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

const BASE_URL = "https://api.cricapi.com/v1";
const API_KEY = process.env.CRICEKT_DATA_API;

// ── Types matching the actual CricAPI /v1/match_scorecard response ──────────

interface ScoreEntry {
  r: number;
  w: number;
  o: number;
  inning: string;
}

interface RawBatsman {
  batsman?: { name: string };
  r?: number;
  b?: number;
  sr?: number;           // number in real API
  "4s"?: number;
  "6s"?: number;
  "dismissal-text"?: string;
  dismissal?: string;
}

interface RawBowler {
  bowler?: { name: string };
  o?: number;
  r?: number;
  w?: number;
  eco?: number;          // number in real API
  m?: number;
}

interface RawInning {
  inning: string;
  batting?: RawBatsman[];
  bowling?: RawBowler[];
}

interface ScorecardApiResponse {
  status: string;
  data?: {
    id: string;
    score?: ScoreEntry[];
    scorecard?: RawInning[];
    teams?: string[];
    teamInfo?: { name: string; shortname: string }[];
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getApiKey(): string {
  if (!API_KEY) throw new Error("CRICEKT_DATA_API env var not set.");
  return API_KEY;
}

/**
 * Fetches /v1/match_scorecard for a given CricAPI match UUID and
 * returns a mapped MatchScorecard object (or null if unavailable).
 */
async function fetchAndMapScorecard(
  cricApiId: string,
  fallbackScores: ScoreEntry[],
): Promise<Prisma.InputJsonValue | null> {
  const url = `${BASE_URL}/match_scorecard?apikey=${getApiKey()}&id=${cricApiId}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`   ⚠️  HTTP ${res.status} for match ${cricApiId}`);
    return null;
  }

  const json = (await res.json()) as ScorecardApiResponse;
  if (json.status !== "success" || !json.data) {
    console.warn(`   ⚠️  API status "${json.status}" for ${cricApiId}`);
    return null;
  }

  const rawInnings: RawInning[] = json.data.scorecard ?? [];
  if (rawInnings.length === 0) {
    console.warn(`   ⚠️  Empty scorecard for ${cricApiId}`);
    return null;
  }

  // Use data.score from scorecard endpoint; fall back to the scores we already have
  const scoreData: ScoreEntry[] =
    json.data.score?.length ? json.data.score : fallbackScores;

  const innings = rawInnings.map((inning) => {
    const teamName = inning.inning?.split(" Inning")[0] || "Unknown";
    const inningScore = scoreData.find((s) => s.inning === inning.inning);

    return {
      team:    teamName,
      total:   inningScore?.r ?? 0,
      wickets: inningScore?.w ?? 0,
      overs:   inningScore?.o ?? 0,
      batting: (inning.batting ?? []).map((b) => ({
        player:     b.batsman?.name ?? "Unknown",
        runs:       b.r ?? 0,
        balls:      b.b ?? 0,
        strikeRate: b.sr ?? 0,
        fours:      b["4s"] ?? 0,
        sixes:      b["6s"] ?? 0,
        out:
          (b["dismissal-text"] ?? "").toLowerCase() === "not out" || !b.dismissal
            ? "not out"
            : "out",
      })),
      bowling: (inning.bowling ?? []).map((b) => ({
        player:  b.bowler?.name ?? "Unknown",
        overs:   b.o ?? 0,
        runs:    b.r ?? 0,
        wickets: b.w ?? 0,
        maidens: b.m ?? 0,
        economy: b.eco ?? 0,
      })),
    };
  });

  return { innings } as Prisma.InputJsonValue;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  console.log("==================================================");
  console.log("🏏 SYNC LIVE SCORECARDS (CricAPI → DB)");
  console.log("==================================================");

  if (!API_KEY) {
    console.error("❌ CRICEKT_DATA_API not set.");
    process.exit(1);
  }

  // Fetch all 2026 matches that have no scorecard yet.
  // We rely on the externalId format YYYY-MM-DD_X_v_Y to filter by year.
  const matches = await prisma.match.findMany({
    where: {
      scorecard: { equals: Prisma.AnyNull },
      matchDate: {
        gte: new Date("2026-01-01T00:00:00.000Z"),
      },
    },
    select: {
      id:           true,
      externalId:   true,
      homeTeam:     true,
      awayTeam:     true,
      matchDate:    true,
      scoreSummary: true,
    },
    orderBy: { matchDate: "asc" },
  });

  console.log(`\nFound ${matches.length} 2026 match(es) with missing scorecards.\n`);

  if (matches.length === 0) {
    console.log("✅ Nothing to do. All 2026 matches already have scorecards.");
    return;
  }

  // CricAPI doesn't store our SLUG externalIds — we need to call the
  // /v1/currentMatches or /v1/series_matches to resolve CricAPI UUIDs.
  // For simplicity, we call /v1/currentMatches (returns last ~25 matches)
  // and match by date + team names.

  console.log("Fetching current CricAPI match list for UUID resolution...");
  const listRes = await fetch(
    `${BASE_URL}/currentMatches?apikey=${getApiKey()}&offset=0`,
  );
  if (!listRes.ok) throw new Error(`currentMatches HTTP ${listRes.status}`);
  const listJson = await listRes.json();
  const cricApiMatches: Array<{
    id: string;
    name: string;
    date: string;
    teams: string[];
    score?: ScoreEntry[];
    matchEnded: boolean;
  }> = listJson.data ?? [];

  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const match of matches) {
    const dateStr = match.matchDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // Try to find the CricAPI UUID by matching date + both team names
    const cricMatch = cricApiMatches.find((m) => {
      if (m.date !== dateStr) return false;
      const nameLC = m.name.toLowerCase();
      return (
        nameLC.includes(match.homeTeam.toLowerCase()) ||
        nameLC.includes(match.awayTeam.toLowerCase())
      );
    });

    if (!cricMatch) {
      console.log(
        `   ⚠️  ${match.externalId} — not found in currentMatches (too old?). Skipping.`,
      );
      skipped++;
      continue;
    }

    console.log(`   Syncing ${match.externalId} (CricAPI id: ${cricMatch.id}) ...`);

    const scorecard = await fetchAndMapScorecard(
      cricMatch.id,
      cricMatch.score ?? [],
    );

    if (!scorecard) {
      failed++;
      continue;
    }

    await prisma.match.update({
      where: { id: match.id },
      data:  { scorecard },
    });

    const inningsCount = (scorecard as { innings: unknown[] }).innings?.length ?? 0;
    console.log(`   ✅ Saved ${inningsCount} innings for ${match.externalId}`);
    synced++;

    // Brief pause to stay within API rate limits
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n==================================================");
  console.log("🚀 SYNC COMPLETE");
  console.log(`   ✅ Synced : ${synced}`);
  console.log(`   ⚠️  Skipped: ${skipped} (not in currentMatches window)`);
  console.log(`   ❌ Failed : ${failed}`);
  console.log("==================================================");
}

run()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\n[DB] Connection closed.");
  });
