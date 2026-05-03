/**
 * lib/ai/cricapi.ts
 *
 * CricAPI client — handles batch fetching of completed IPL matches.
 * 
 * FEATURES:
 * - Deduplication: Skips matches already in DB.
 * - Scorecard Recovery: If a match is in the DB but lacks a scorecard, 
 *   it will be re-processed to attempt to fill the missing data.
 * - Chronological Order: Matches are processed oldest-first for data consistency.
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
// CricAPI response shapes
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

interface CricApiMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: TeamInfo[];
  score: ScoreEntry[];
  series_id: string;
  matchStarted: boolean;
  matchEnded: boolean;
  matchWinner?: string;
  tossWinner?: string;
  tossChoice?: string;
  playerOfMatch?: Array<{ id: string; name: string }> | string;
  playerOfTheMatch?: Array<{ id: string; name: string }> | string;
}

interface RawCricApiBatsman {
  batsman?: { name: string };
  r?: number;
  b?: number;
  sr?: number;
  "4s"?: number;
  "6s"?: number;
  "dismissal-text"?: string;
  dismissal?: string;
}

interface RawCricApiBowler {
  bowler?: { name: string };
  o?: number;
  r?: number;
  w?: number;
  eco?: number;
  m?: number;
}

interface RawCricApiInning {
  inning: string;
  batting?: RawCricApiBatsman[];
  bowling?: RawCricApiBowler[];
}

interface CurrentMatchesResponse {
  apikey: string;
  data: CricApiMatch[];
  status: string;
}

interface MatchInfoResponse {
  apikey: string;
  data: CricApiMatch;
  status: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiKey(): string {
  if (!API_KEY) throw new Error("[CRICAPI] Missing CRICEKT_DATA_API.");
  return API_KEY;
}

function toMidnightUTC(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`;
}

function buildScoreSummary(score: ScoreEntry[], teams: string[], teamInfo: TeamInfo[]): string {
  if (!score || score.length === 0) return `${teams.join(" vs ")}`;
  return score.map((entry, index) => {
    const lowerInning = entry.inning.toLowerCase();
    const mentionedTeams = teamInfo.filter((t) => lowerInning.includes(t.name.toLowerCase()));
    let label = "";
    if (mentionedTeams.length === 1) {
      label = mentionedTeams[0].shortname;
    } else if (mentionedTeams.length > 1) {
      if (index > 0) {
        const prevInningTeam = teamInfo.find(t => score[index-1].inning.toLowerCase().includes(t.name.toLowerCase()));
        const currentTeam = mentionedTeams.find(t => t.name !== prevInningTeam?.name);
        label = currentTeam?.shortname ?? mentionedTeams[0].shortname;
      } else {
        label = mentionedTeams[0].shortname;
      }
    } else {
      label = entry.inning.split(" Inning")[0];
    }
    return `${label} ${entry.r}/${entry.w} (${entry.o} ov)`;
  }).join(" | ");
}

function deriveWinnerLoser(status: string, teams: string[], explicitWinner?: string): { winner: string | null; loser: string | null } {
  if (explicitWinner) {
    const winner = teams.find(t => t.toLowerCase() === explicitWinner.toLowerCase()) ?? explicitWinner;
    const loser = teams.find(t => t.toLowerCase() !== explicitWinner.toLowerCase()) ?? null;
    return { winner, loser };
  }
  if (!status || teams.length < 2) return { winner: null, loser: null };
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
// Single Match Fetcher (Private)
// ---------------------------------------------------------------------------

async function fetchFullMatchData(match: CricApiMatch): Promise<Extract<AIResponseMatchPayload, { matchFound: true }> | null> {
  const matchId = match.id;
  try {
    const infoUrl = `${BASE_URL}/match_info?apikey=${getApiKey()}&id=${matchId}`;
    const infoRes = await fetch(infoUrl);
    if (!infoRes.ok) return null;
    const infoBody = (await infoRes.json()) as MatchInfoResponse;
    const info = infoBody.data;

    const scUrl = `${BASE_URL}/match_scorecard?apikey=${getApiKey()}&id=${matchId}`;
    const scRes = await fetch(scUrl);
    let rawScorecards: RawCricApiInning[] = [];
    if (scRes.ok) {
      const scBody = await scRes.json();
      if (scBody.status === "success" && scBody.data) {
        rawScorecards = scBody.data.scorecard ?? [];
      }
    }

    const scoreData: ScoreEntry[] = info.score?.length ? info.score : (match.score?.length ? match.score : []);
    const mappedInnings = rawScorecards.map((inning) => {
      const teamName = inning.inning?.split(" Inning")[0] || "Unknown";
      const inningScore = scoreData.find((s) => s.inning === inning.inning);
      return {
        team: teamName,
        total: inningScore?.r ?? 0,
        wickets: inningScore?.w ?? 0,
        overs: inningScore?.o ?? 0,
        batting: (inning.batting ?? []).map((b) => ({
          player: b.batsman?.name ?? "Unknown",
          runs: b.r ?? 0,
          balls: b.b ?? 0,
          strikeRate: b.sr ?? 0,
          fours: b["4s"] ?? 0,
          sixes: b["6s"] ?? 0,
          out: (b["dismissal-text"] ?? "").toLowerCase() === "not out" || !b.dismissal ? "not out" : "out",
        })),
        bowling: (inning.bowling ?? []).map((b) => ({
          player: b.bowler?.name ?? "Unknown",
          overs: b.o ?? 0,
          runs: b.r ?? 0,
          wickets: b.w ?? 0,
          maidens: b.m ?? 0,
          economy: b.eco ?? 0,
        })),
      };
    });

    const infoTeams = info.teams ?? [];
    const teamInfo = info.teamInfo ?? [];
    const homeTeam = infoTeams[0] ?? "";
    const awayTeam = infoTeams[1] ?? "";
    const uniformExternalId = buildUniformExternalId(toMidnightUTC(info.date), homeTeam, awayTeam);
    const { winner, loser } = deriveWinnerLoser(info.status, infoTeams, info.matchWinner);
    const rawPom = info.playerOfMatch ?? info.playerOfTheMatch ?? null;
    const playerOfMatch: string | null = Array.isArray(rawPom) ? (rawPom[0]?.name ?? null) : (typeof rawPom === "string" ? rawPom : null);

    return {
      matchFound: true,
      externalId: uniformExternalId,
      homeTeam,
      awayTeam,
      homeTeamShort: teamInfo[0]?.shortname ?? homeTeam.slice(0, 3).toUpperCase(),
      awayTeamShort: teamInfo[1]?.shortname ?? awayTeam.slice(0, 3).toUpperCase(),
      scoreSummary: buildScoreSummary(scoreData, infoTeams, teamInfo),
      matchStatus: info.status,
      venue: info.venue,
      winner,
      loser,
      matchDate: toMidnightUTC(info.date),
      scorecard: mappedInnings.length > 0 ? { innings: mappedInnings } : undefined,
      playerOfMatch,
    };
  } catch (err) {
    console.error(`[CRICAPI] Error fetching data for match ${matchId}:`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Batch Fetcher (Exported)
// ---------------------------------------------------------------------------

export async function fetchNewIPLMatches(): Promise<Extract<AIResponseMatchPayload, { matchFound: true }>[]> {
  const url = `${BASE_URL}/currentMatches?apikey=${getApiKey()}&offset=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`[CRICAPI] HTTP ${res.status}`);
  const body = (await res.json()) as CurrentMatchesResponse;
  
  // 1. Filter to completed IPL matches
  const completedIPL = body.data.filter((m) => 
    m.name.toLowerCase().includes("indian premier league") && m.matchEnded === true
  );

  if (completedIPL.length === 0) return [];

  // Sort by dateTimeGMT ascending (oldest first) to ensure correct DB insertion order
  completedIPL.sort(
    (a, b) => new Date(a.dateTimeGMT).getTime() - new Date(b.dateTimeGMT).getTime()
  );

  const results: Extract<AIResponseMatchPayload, { matchFound: true }>[] = [];
  for (const m of completedIPL) {
    const teams = m.teams ?? [];
    const uniformId = buildUniformExternalId(toMidnightUTC(m.date), teams[0] ?? "", teams[1] ?? "");
    const existing = await prisma.match.findUnique({
      where: { externalId: uniformId },
      select: { id: true, scorecard: true },
    });

    // Scorecard Recovery Logic:
    // If NOT in DB, OR if in DB but scorecard is missing/empty, we process it.
    let needsIngestion = false;
    if (!existing) {
      console.log(`[CRICAPI] 🆕 NEW match detected: ${m.name}`);
      needsIngestion = true;
    } else {
      const sc = existing.scorecard as any;
      const hasInnings = sc && Array.isArray(sc.innings) && sc.innings.length > 0;
      if (!hasInnings) {
        console.log(`[CRICAPI] 🩹 RECOVERY: Match ${m.name} exists but is missing a scorecard. Re-fetching...`);
        needsIngestion = true;
      }
    }

    if (needsIngestion) {
      const fullData = await fetchFullMatchData(m);
      if (fullData) results.push(fullData);
    }
  }
  return results;
}

export async function fetchRecentIPLMatch(): Promise<AIResponseMatchPayload> {
  const news = await fetchNewIPLMatches();
  if (news.length === 0) return { matchFound: false };
  return news[0];
}
