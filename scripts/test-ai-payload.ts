import "dotenv/config";
import { execSync } from "child_process";
import { prisma } from "../lib/prisma.js";
import { type AIResponseMatchPayload } from "../lib/validations/models.js";
import { getTeamShortName } from "../lib/utils/match.js";

function resolveShortName(fullName: string): string {
  return getTeamShortName(fullName);
}

async function getTeamSeasonStats(teamName: string, year: number) {
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ homeTeam: teamName }, { awayTeam: teamName }],
      matchDate: { gte: startOfYear, lte: endOfYear },
    },
    orderBy: { matchDate: "asc" },
  });

  let wins = 0;
  let streakCount = 0;
  let streakType: "W" | "L" | null = null;

  for (const m of matches) {
    const isWinner = m.winner === teamName;
    const isLoser = m.loser === teamName;

    if (isWinner) {
      wins++;
      if (streakType === "W") {
        streakCount++;
      } else {
        streakType = "W";
        streakCount = 1;
      }
    } else if (isLoser) {
      if (streakType === "L") {
        streakCount++;
      } else {
        streakType = "L";
        streakCount = 1;
      }
    }
  }

  return {
    wins,
    played: matches.length,
    streak: streakType ? `${streakType}${streakCount}` : "N/A",
  };
}

async function run() {
  const match = await prisma.match.findFirst({
    where: { matchDate: { gte: new Date('2026-01-01') } },
    orderBy: { matchDate: "asc" },
    select: {
      id:               true,
      externalId:       true,
      homeTeam:         true,
      awayTeam:         true,
      scoreSummary:     true,
      matchDate:        true,
      venue:            true,
      winner:           true,
      loser:            true,
      playerOfTheMatch: true,
      scorecard:        true,
    },
  });

  if (!match) {
    console.error("No 2026 matches found.");
    process.exit(1);
  }

  const season = match.matchDate.getFullYear();
  const homeStats = await getTeamSeasonStats(match.homeTeam, season);
  const awayStats = await getTeamSeasonStats(match.awayTeam, season);

  const payload: Extract<AIResponseMatchPayload, { matchFound: true }> = {
    matchFound:    true,
    externalId:    match.externalId,
    homeTeam:      match.homeTeam,
    awayTeam:      match.awayTeam,
    homeTeamShort: resolveShortName(match.homeTeam),
    awayTeamShort: resolveShortName(match.awayTeam),
    scoreSummary:  match.scoreSummary,
    matchStatus:   match.winner
      ? `${match.winner} won the match`
      : "Match tied or result unavailable",
    venue:         match.venue,
    winner:        match.winner,
    loser:         match.loser,
    matchDate:     match.matchDate.toISOString(),
    playerOfMatch: match.playerOfTheMatch ?? null,
    scorecard:
      match.scorecard !== null
        ? (typeof match.scorecard === "string"
            ? JSON.parse(match.scorecard)
            : match.scorecard)
        : undefined,
    homeTeamStats: homeStats,
    awayTeamStats: awayStats,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  console.log("=== EXACT AI PAYLOAD FOR 2026 MATCH ===");
  console.log(jsonString);

  try {
    try {
      execSync('wl-copy', { input: jsonString, stdio: 'ignore' });
      console.log("\n✅ Payload copied to clipboard (wl-copy)!");
    } catch {
      execSync('xclip -selection clipboard', { input: jsonString, stdio: 'ignore' });
      console.log("\n✅ Payload copied to clipboard (xclip)!");
    }
  } catch (err) {
    console.log("\n⚠️ Could not automatically copy to clipboard. Ensure wl-copy or xclip is installed.");
  }

  await prisma.$disconnect();
}

run();
