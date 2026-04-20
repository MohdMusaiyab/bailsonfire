/**
 * lib/utils/match.ts
 *
 * Shared utilities for match data processing and identification.
 */

import { type MatchScorecard } from "../validations/models.js";

const KNOWN_TEAM_SHORTS: Record<string, string> = {
  // Active Franchises
  "Chennai Super Kings": "CSK",
  "Delhi Capitals": "DC",
  "Gujarat Titans": "GT",
  "Kolkata Knight Riders": "KKR",
  "Lucknow Super Giants": "LSG",
  "Mumbai Indians": "MI",
  "Punjab Kings": "PBKS",
  "Rajasthan Royals": "RR",
  "Royal Challengers Bengaluru": "RCB",
  "Sunrisers Hyderabad": "SRH",

  // Legacy/Defunct/Alternate Spellings
  "Delhi Daredevils": "DC", // Folded into Delhi Capitals
  "Kings XI Punjab": "PBKS", // Folded into Punjab Kings
  "Royal Challengers Bangalore": "RCB",
  "Deccan Chargers": "DCG",
  "Pune Warriors": "PWI",
  "Kochi Tuskers Kerala": "KTK",
  "Gujarat Lions": "GL",
  "Rising Pune Supergiant": "RPS",
  "Rising Pune Supergiants": "RPS",
};

/**
 * Derives a 3-4 letter abbreviation for a team name.
 */
export function getTeamShortName(teamName: string): string {
  if (KNOWN_TEAM_SHORTS[teamName]) {
    return KNOWN_TEAM_SHORTS[teamName];
  }

  // Fallback: take the first letter of each word
  const words = teamName.split(" ").filter(Boolean);
  if (words.length >= 2) {
    return words.map((w) => w[0].toUpperCase()).join("");
  }

  // If it's a single word, just take the first 3 letters
  return teamName.substring(0, 3).toUpperCase();
}

/**
 * Builds a universal, clean, visually uniform external ID.
 * Format: YYYY-MM-DD_<TeamA>_v_<TeamB>
 * Order of teams is strictly alphabetical to prevent duplicates on the same day.
 * Example: "2026-04-18_CSK_v_RCB"
 */
export function buildUniformExternalId(dateStr: string | Date, team1: string, team2: string): string {
  // Normalize date down to YYYY-MM-DD
  let isoDate = "";
  if (dateStr instanceof Date) {
    isoDate = dateStr.toISOString().split("T")[0];
  } else {
    isoDate = new Date(dateStr).toISOString().split("T")[0];
  }

  const short1 = getTeamShortName(team1);
  const short2 = getTeamShortName(team2);

  // Alphabetical sort ensures CSK v RCB and RCB v CSK yield the exact same ID
  const [first, second] = [short1, short2].sort();

  return `${isoDate}_${first}_v_${second}`;
}

export interface CricsheetMatch {
  info: {
    dates: string[];
    event?: { name: string };
    season: string | number;
    teams: string[];
    venue: string;
  };
  innings: Array<{
    team: string;
    overs: Array<{
      over: number;
      deliveries: Array<{
        batter: string;
        bowler: string;
        runs: { total: number; batter: number; extras: number };
        wickets?: Array<{ player_out: string; kind: string }>;
        extras?: { wides?: number; noballs?: number; legbyes?: number; byes?: number };
      }>;
    }>;
  }>;
}

export function buildScorecard(doc: CricsheetMatch): MatchScorecard {
  const innings = doc.innings.map((inning) => {
    let totalRuns = 0;
    let totalWickets = 0;
    let legalDeliveries = 0;

    const battingStats: Record<string, { runs: number; balls: number; out: string }> = {};
    const bowlingStats: Record<string, { balls: number; runs: number; wickets: number }> = {};

    for (const over of inning.overs) {
      for (const d of over.deliveries) {
        // Team totals
        totalRuns += d.runs.total;
        if (d.wickets) {
          totalWickets += d.wickets.length;
        }

        const isWide = !!d.extras?.wides;
        const isNoBall = !!d.extras?.noballs;
        const isLegal = !isWide && !isNoBall;

        if (isLegal) legalDeliveries++;

        // Batting stats
        if (!battingStats[d.batter]) {
          battingStats[d.batter] = { runs: 0, balls: 0, out: "not out" };
        }
        battingStats[d.batter].runs += d.runs.batter;
        if (!isWide) {
          battingStats[d.batter].balls++;
        }
        if (d.wickets && d.wickets.some((w) => w.player_out === d.batter)) {
          battingStats[d.batter].out = "out";
        }

        // Bowling stats
        if (!bowlingStats[d.bowler]) {
          bowlingStats[d.bowler] = { balls: 0, runs: 0, wickets: 0 };
        }
        
        let bowlerRuns = d.runs.batter;
        if (isWide) bowlerRuns += d.extras!.wides!;
        if (isNoBall) bowlerRuns += d.extras!.noballs!;
        bowlingStats[d.bowler].runs += bowlerRuns;

        if (isLegal) bowlingStats[d.bowler].balls++;

        if (d.wickets) {
          const bowlerWickets = d.wickets.filter((w) => w.kind !== "run out" && w.kind !== "retired hurt").length;
          bowlingStats[d.bowler].wickets += bowlerWickets;
        }
      }
    }

    const oversStr = `${Math.floor(legalDeliveries / 6)}.${legalDeliveries % 6}`;

    const batting = Object.entries(battingStats).map(([player, stats]) => ({
      player,
      runs: stats.runs,
      balls: stats.balls,
      strikeRate: stats.balls > 0 ? parseFloat(((stats.runs / stats.balls) * 100).toFixed(2)) : 0,
      out: stats.out,
    }));

    const bowling = Object.entries(bowlingStats).map(([player, stats]) => {
      const overs = parseFloat(`${Math.floor(stats.balls / 6)}.${stats.balls % 6}`);
      return {
        player,
        overs,
        runs: stats.runs,
        wickets: stats.wickets,
        economy: stats.balls > 0 ? parseFloat(((stats.runs / (stats.balls / 6)).toFixed(2))) : 0,
      };
    });

    return {
      team: inning.team,
      total: totalRuns,
      wickets: totalWickets,
      overs: parseFloat(oversStr),
      batting,
      bowling,
    };
  });

  return { innings };
}
