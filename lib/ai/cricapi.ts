/**
 * lib/ai/cricapi.ts
 *
 * CricAPI client — replaces the Gemini Google-Search-grounded Stage 1.
 *
 * Flow:
 *   1. GET /v1/currentMatches  → filter to completed IPL matches
 *   2. Early DB dedup check    → skip if already saved
 *   3. GET /v1/match_info      → fetch full details for the chosen match
 *   4. Map response            → return typed AIResponseMatchPayload
 *
 * The CricAPI match UUID is used directly as the DB `externalId`.
 */

import { prisma } from "../prisma.js";
import { type AIResponseMatchPayload } from "../validations/models.js";
import { buildUniformExternalId } from "../utils/match.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.cricapi.com/v1";
const API_KEY = process.env.CRICEKT_DATA_API;

// ---------------------------------------------------------------------------
// CricAPI response shapes (raw — not everything, just what we need)
// ---------------------------------------------------------------------------

interface TeamInfo {
  name: string;
  shortname: string;
  img: string;
}

interface ScoreEntry {
  r: number;
  w: number;
  o: number;
  inning: string;
}

/** Shape of a single match object from /v1/currentMatches */
interface CricApiMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string; // "YYYY-MM-DD"
  dateTimeGMT: string; // "YYYY-MM-DDTHH:MM:SS"
  teams: string[];
  teamInfo: TeamInfo[];
  score: ScoreEntry[];
  series_id: string;
  matchStarted: boolean;
  matchEnded: boolean;
}

/** Shape of /v1/match_scorecard raw objects */
interface RawCricApiInning {
  inning: string;
  batting?: Array<{
    batsman?: { name: string };
    r?: number;
    b?: number;
    sr?: string;
    dismissal?: string;
  }>;
  bowling?: Array<{
    bowler?: { name: string };
    o?: number;
    r?: number;
    w?: number;
    eco?: string;
  }>;
}

/** Shape of /v1/currentMatches response */
interface CurrentMatchesResponse {
  apikey: string;
  data: CricApiMatch[];
  status: string;
  info?: { hitsUsed: number; hitsLimit: number };
}

/** /v1/match_info returns the same base shape — alias it, don't re-declare */
type MatchInfoData = CricApiMatch;

/** Shape of /v1/match_info response */
interface MatchInfoResponse {
  apikey: string;
  data: MatchInfoData;
  status: string;
}

// ---------------------------------------------------------------------------
// Helper: assert API key at call time (not at module load — avoids issues
// when the module is imported in contexts where the env is not yet loaded)
// ---------------------------------------------------------------------------

function getApiKey(): string {
  if (!API_KEY) {
    throw new Error(
      "[CRICAPI] Missing CRICEKT_DATA_API environment variable."
    );
  }
  return API_KEY;
}

// ---------------------------------------------------------------------------
// Helper: build scoreSummary string from raw score entries
// ---------------------------------------------------------------------------

/**
 * Converts the CricAPI score array into a human-readable summary string.
 * Example: "SRH 167/8 (20 ov) | CSK 171/4 (19.2 ov)"
 */
function buildScoreSummary(
  score: ScoreEntry[],
  teams: string[],
  teamInfo: TeamInfo[]
): string {
  if (!score || score.length === 0) {
    return teams.join(" vs ");
  }

  // Build a short→full name map from teamInfo for abbreviation
  const shortNames = teamInfo.map((t) => t.shortname);

  return score
    .map((entry) => {
      // The inning string is like "Chennai Super Kings Inning 1" — extract team name
      // We try to find the matching shortname from teamInfo
      const matchingTeam = teamInfo.find((t) =>
        entry.inning.toLowerCase().includes(t.name.toLowerCase())
      );
      const label = matchingTeam?.shortname ?? entry.inning.split(" Inning")[0];
      return `${label} ${entry.r}/${entry.w} (${entry.o} ov)`;
    })
    .join(" | ");

  void shortNames; // suppress unused-var warnings
}

// ---------------------------------------------------------------------------
// Helper: derive winner / loser from status string
// ---------------------------------------------------------------------------

/**
 * CricAPI embeds the result in the `status` field as free text, e.g.:
 *   "Chennai Super Kings won by 5 wickets"
 *   "Sunrisers Hyderabad won by 22 runs"
 *
 * We scan both team names against the status to identify winner & loser.
 */
function deriveWinnerLoser(
  status: string,
  teams: string[]
): { winner: string | null; loser: string | null } {
  if (!status || teams.length < 2) {
    return { winner: null, loser: null };
  }

  const lowerStatus = status.toLowerCase();

  for (const team of teams) {
    if (lowerStatus.includes(team.toLowerCase()) && lowerStatus.includes("won")) {
      const loser = teams.find((t) => t !== team) ?? null;
      return { winner: team, loser };
    }
  }

  return { winner: null, loser: null };
}

// ---------------------------------------------------------------------------
// Helper: normalise a date string to ISO midnight UTC
// ---------------------------------------------------------------------------

/** "2026-04-18" → "2026-04-18T00:00:00.000Z" */
function toMidnightUTC(dateStr: string): string {
  // dateStr is already YYYY-MM-DD from CricAPI
  return `${dateStr}T00:00:00.000Z`;
}

// ---------------------------------------------------------------------------
// API call: GET /v1/currentMatches
// ---------------------------------------------------------------------------

async function fetchCurrentMatches(): Promise<CricApiMatch[]> {
  const url = `${BASE_URL}/currentMatches?apikey=${getApiKey()}&offset=0`;

  console.log("[CRICAPI] 📡 GET /v1/currentMatches ...");
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `[CRICAPI] /currentMatches responded with HTTP ${res.status} ${res.statusText}`
    );
  }

  const body = (await res.json()) as CurrentMatchesResponse;

  if (body.status !== "success" || !Array.isArray(body.data)) {
    throw new Error(
      `[CRICAPI] Unexpected response shape from /currentMatches: status="${body.status}"`
    );
  }

  console.log(`[CRICAPI]  → Received ${body.data.length} match(es) total.`);
  return body.data;
}

// ---------------------------------------------------------------------------
// API call: GET /v1/match_info
// ---------------------------------------------------------------------------

async function fetchMatchInfo(matchId: string): Promise<MatchInfoData> {
  const url = `${BASE_URL}/match_info?apikey=${getApiKey()}&id=${matchId}`;

  console.log(`[CRICAPI] 📡 GET /v1/match_info?id=${matchId} ...`);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `[CRICAPI] /match_info responded with HTTP ${res.status} ${res.statusText}`
    );
  }

  const body = (await res.json()) as MatchInfoResponse;

  if (body.status !== "success" || !body.data) {
    throw new Error(
      `[CRICAPI] Unexpected response shape from /match_info: status="${body.status}"`
    );
  }

  return body.data;
}

// ---------------------------------------------------------------------------
// Main export: orchestrates both calls, dedup, and mapping
// ---------------------------------------------------------------------------

/**
 * Fetches the latest completed IPL match from CricAPI and returns a typed
 * `AIResponseMatchPayload`. Returns `{ matchFound: false }` if:
 *   - No completed IPL match is found in the current list
 *   - The most recent completed IPL match is already in the DB (dedup)
 *
 * This function is a drop-in replacement for `fetchRecentMatchData()` in gemini.ts.
 */
export async function fetchRecentIPLMatch(): Promise<AIResponseMatchPayload> {
  // ── Step 1: Get the full current match list ─────────────────────────────
  const allMatches = await fetchCurrentMatches();

  // ── Step 2: Filter to completed IPL matches ─────────────────────────────
  const completedIPLMatches = allMatches.filter((m) => {
    const isIPL = m.name.toLowerCase().includes("indian premier league");
    const isCompleted = m.matchEnded === true;
    return isIPL && isCompleted;
  });

  console.log(
    `[CRICAPI]  → ${completedIPLMatches.length} completed IPL match(es) found after filtering.`
  );

  if (completedIPLMatches.length === 0) {
    console.log("[CRICAPI] ✅ No completed IPL match available. Returning matchFound: false.");
    return { matchFound: false };
  }

  // ── Step 3: Pick the most recently ended match ──────────────────────────
  // Sort descending by dateTimeGMT so index 0 is the newest
  completedIPLMatches.sort(
    (a, b) =>
      new Date(b.dateTimeGMT).getTime() - new Date(a.dateTimeGMT).getTime()
  );

  const latest = completedIPLMatches[0];
  console.log(`[CRICAPI]  → Latest completed IPL match: "${latest.name}" (id: ${latest.id})`);

  // ── Step 4: Early DB dedup — use Uniform Source ID ─────────────
  // Even though we have the CricAPI UUID, we use our unified SLUG to ensure
  // 100% uniformity in the database.
  const teams = latest.teams ?? [];
  const homeTeamRaw = teams[0] ?? "";
  const awayTeamRaw = teams[1] ?? "";
  
  const uniformExternalId = buildUniformExternalId(
    toMidnightUTC(latest.date), 
    homeTeamRaw, 
    awayTeamRaw
  );

  const existing = await prisma.match.findUnique({
    where: { externalId: uniformExternalId },
    select: { id: true, createdAt: true },
  });

  if (existing) {
    console.log(
      `[CRICAPI] ✅ DUPLICATE — Match "${uniformExternalId}" already in DB (saved ${existing.createdAt.toISOString()}). ` +
        `Skipping match_info call.`
    );
    return { matchFound: false };
  }

  console.log("[CRICAPI]  → Not in DB. Fetching full match info...");

  // ── Step 5: Fetch full match details & scorecard ────────────────────────────────────
  const info = await fetchMatchInfo(latest.id);

  const scorecardRes = await fetch(
    `https://api.cricapi.com/v1/match_scorecard?apikey=${process.env.CRICEKT_DATA_API}&id=${latest.id}`
  );
  if (!scorecardRes.ok) {
    throw new Error(`CricAPI scorecard error: ${scorecardRes.status}`);
  }
  const scorecardJson = await scorecardRes.json();
  const rawScorecards = scorecardJson.data?.scorecard ?? [];

  // Map to our optimized MatchScorecard format
  const mappedInnings = rawScorecards.map((inning: RawCricApiInning) => {
    // Attempt to extract team name from inning header like "Rajasthan Royals Inning 1"
    const teamName = inning.inning?.split(" Inning")[0] || "Unknown";
    
    // Find matching score object from info.score to get total, wkts, overs
    const scoreSummary = info.score?.find((s: ScoreEntry) => s.inning === inning.inning);

    return {
      team: teamName,
      total: scoreSummary?.r ?? 0,
      wickets: scoreSummary?.w ?? 0,
      overs: scoreSummary?.o ?? 0,
      batting: (inning.batting ?? []).map((b) => ({
        player: b.batsman?.name ?? "Unknown",
        runs: b.r ?? 0,
        balls: b.b ?? 0,
        strikeRate: b.sr ? parseFloat(b.sr) : 0,
        out: b.dismissal === "not out" ? "not out" : "out",
      })),
      bowling: (inning.bowling ?? []).map((b) => ({
        player: b.bowler?.name ?? "Unknown",
        overs: b.o ?? 0,
        runs: b.r ?? 0,
        wickets: b.w ?? 0,
        economy: b.eco ? parseFloat(b.eco) : 0,
      })),
    };
  });

  const scorecard = { innings: mappedInnings };

  // ── Step 6: Map to AIResponseMatchPayload ───────────────────────────────
  // We re-use teams from `info` just to be consistent
  const infoTeams = info.teams ?? [];
  const teamInfo = info.teamInfo ?? [];

  // teams[0] = home, teams[1] = away (as returned by the API)
  const homeTeam = infoTeams[0] ?? "";
  const awayTeam = infoTeams[1] ?? "";
  const homeTeamShort = teamInfo[0]?.shortname ?? homeTeam.slice(0, 3).toUpperCase();
  const awayTeamShort = teamInfo[1]?.shortname ?? awayTeam.slice(0, 3).toUpperCase();

  const scoreSummary = buildScoreSummary(info.score, infoTeams, teamInfo);
  const { winner, loser } = deriveWinnerLoser(info.status, infoTeams);
  const matchDate = toMidnightUTC(info.date);

  // Note: we've already computed uniformExternalId above, but we use it here again securely
  
  const payload: AIResponseMatchPayload = {
    matchFound: true,
    externalId: uniformExternalId, // Unified SLUG
    homeTeam,
    awayTeam,
    homeTeamShort,
    awayTeamShort,
    scoreSummary,
    matchStatus: info.status, // e.g. "Delhi Capitals won by 5 wickets" — fuel for the roast
    venue: info.venue,
    winner,
    loser,
    matchDate,
    scorecard,
  };

  console.log(
    `[CRICAPI] ✅ Match mapped: ${homeTeam} vs ${awayTeam} on ${info.date}`
  );
  console.log(`[CRICAPI]  → Score: ${scoreSummary}`);
  console.log(`[CRICAPI]  → Winner: ${winner ?? "Unknown"}`);

  return payload;
}
