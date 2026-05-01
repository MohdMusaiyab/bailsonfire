/**
 * scripts/seed-cricsheet.ts
 *
 * Ingests historical Cricsheet IPL matches (2008-2026) into the DB.
 * Skips AI generation.
 * 
 * Run with: npx tsx scripts/seed-cricsheet.ts
 */

import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { prisma } from "../lib/prisma.js";
import { buildUniformExternalId } from "../lib/utils/match.js";

// Directory containing JSON files
const DATA_DIR = path.join(process.cwd(), "ipl_json");
const BATCH_SIZE = 50;

// Normalize legacy names to their active modern franchise equivalent
const normalizeTeamName = (name: string): string => {
  const mappings: Record<string, string> = {
    "Delhi Daredevils": "Delhi Capitals",
    "Kings XI Punjab": "Punjab Kings",
    "Royal Challengers Bangalore": "Royal Challengers Bengaluru",
    "Rising Pune Supergiants": "Rising Pune Supergiant",
  };
  return mappings[name] || name;
};

interface CricsheetDelivery {
  runs: {
    total: number;
    batter: number;
    extras: number;
  };
  wickets?: Array<{ player_out: string }>;
  extras?: {
    wides?: number;
    noballs?: number;
    legbyes?: number;
    byes?: number;
    penalty?: number;
  };
}

interface CricsheetMatch {
  info: {
    dates: string[];
    event?: { name: string };
    season: string | number;
    teams: string[];
    venue: string;
    outcome?: {
      winner?: string;
    };
    player_of_match?: string[];
  };
  innings: Array<{
    team: string;
    overs: Array<{
      over: number;
      deliveries: CricsheetDelivery[];
    }>;
  }>;
}

/**
 * Computes the score string for an inning, e.g., "Sunrisers Hyderabad 207/4 (20 ov)"
 */
function buildInningScore(inning: CricsheetMatch["innings"][0]): string {
  let totalRuns = 0;
  let totalWickets = 0;
  let legalDeliveries = 0;

  for (const over of inning.overs) {
    for (const d of over.deliveries) {
      // runs.total natively includes batter runs + all extras (wides, noballs, legbyes, byes)
      totalRuns += d.runs.total;

      if (d.wickets) {
        totalWickets += d.wickets.length;
      }

      // Legal delivery = no wides, no no-balls
      if (!d.extras || (!d.extras.wides && !d.extras.noballs)) {
        legalDeliveries++;
      }
    }
  }

  const overs = Math.floor(legalDeliveries / 6);
  const balls = legalDeliveries % 6;
  const overStr = balls === 0 ? `${overs}` : `${overs}.${balls}`;
  
  const teamName = normalizeTeamName(inning.team);
  return `${teamName} ${totalRuns}/${totalWickets} (${overStr} ov)`;
}

async function runSeed() {
  console.log("==================================================");
  console.log("🏏 SEEDING HISTORICAL CRICSHEET MATCHES (2008-2026)");
  console.log("==================================================");

  let files: string[];
  try {
    files = await fs.readdir(DATA_DIR);
    files = files.filter(f => f.endsWith(".json"));
  } catch (err) {
    console.error(`❌ Could not read directory ${DATA_DIR}. Make sure you extracted the files there.`);
    process.exit(1);
  }

  console.log(`Found ${files.length} JSON files. Discovering valid matches...`);

  const recordsToInsert: any[] = [];
  let skippedNonIPL = 0;

  for (const filename of files) {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    const doc = JSON.parse(raw) as CricsheetMatch;
    
    const info = doc.info;
    const isIPL = info.event?.name?.toLowerCase().includes("indian premier league");
    
    if (!isIPL) {
      skippedNonIPL++;
      continue;
    }

    // Build the scoreSummary string
    const inningSummaries = doc.innings.map(buildInningScore);
    const scoreSummary = inningSummaries.join(" | ");

    // Extract basic fields with normalisation
    const rawHome = info.teams[0] || "Unknown";
    const rawAway = info.teams[1] || "Unknown";
    const homeTeam = normalizeTeamName(rawHome);
    const awayTeam = normalizeTeamName(rawAway);
    
    const winner = info.outcome?.winner ? normalizeTeamName(info.outcome.winner) : null;
    let loser: string | null = null;
    if (winner) {
      loser = winner === homeTeam ? awayTeam : homeTeam;
    }

    const matchDate = new Date(`${info.dates[0]}T00:00:00.000Z`);

    // Add match to our array
    recordsToInsert.push({
      externalId: buildUniformExternalId(matchDate, homeTeam, awayTeam),
      homeTeam,
      awayTeam,
      scoreSummary,
      matchDate,
      venue: info.venue || "Unknown",
      winner,
      loser,
      playerOfTheMatch: info.player_of_match?.[0] ?? null,
      keyMoments: []
    });
  }

  console.log(`\n✅ Finished parsing. Valid matches to insert: ${recordsToInsert.length}`);
  console.log(`   Skipped non-IPL: ${skippedNonIPL}\n`);

  // Process in chunks
  let processed = 0;
  for (let i = 0; i < recordsToInsert.length; i += BATCH_SIZE) {
    const batch = recordsToInsert.slice(i, i + BATCH_SIZE);
    
    await prisma.match.createMany({
      data: batch,
      skipDuplicates: true, 
    });
    
    processed += batch.length;
    console.log(`   Seeded batch: ${processed}/${recordsToInsert.length} ...`);
  }

  console.log("\n==================================================");
  console.log("🚀 SEEDING COMPLETE!");
  console.log("==================================================");

  // Log the most recent match across all parsed records
  if (recordsToInsert.length > 0) {
    const mostRecent = recordsToInsert.reduce((prev, curr) =>
      curr.matchDate > prev.matchDate ? curr : prev
    );
    console.log(`\n📅 Most recent match in dataset:`);
    console.log(`   Date : ${mostRecent.matchDate.toISOString().split("T")[0]}`);
    console.log(`   Teams: ${mostRecent.homeTeam} vs ${mostRecent.awayTeam}`);
    console.log(`   Score: ${mostRecent.scoreSummary}`);
    if (mostRecent.winner) console.log(`   Winner: ${mostRecent.winner}`);
  }
}

runSeed()
  .catch((e) => {
    console.error("❌ Fatal error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
