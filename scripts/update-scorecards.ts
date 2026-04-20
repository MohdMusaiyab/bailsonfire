/**
 * scripts/update-scorecards.ts
 *
 * Retroactively parses `ipl_json/` files to compute full Scorecard JSON objects
 * (batting and bowling figures) and updates existing Match records in the database.
 *
 * Run with: npx tsx scripts/update-scorecards.ts
 */

import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { prisma } from "../lib/prisma.js";
import { buildUniformExternalId, buildScorecard, type CricsheetMatch } from "../lib/utils/match.js";
import { type MatchScorecard } from "../lib/validations/models.js";

const DATA_DIR = path.join(process.cwd(), "ipl_json");

async function run() {
  console.log("==================================================");
  console.log("🏏 RETROACTIVE SCORECARD GENERATION");
  console.log("==================================================");

  let files: string[];
  try {
    files = await fs.readdir(DATA_DIR);
    files = files.filter(f => f.endsWith(".json"));
  } catch (err) {
    console.error(`❌ Could not read directory ${DATA_DIR}.`);
    process.exit(1);
  }

  const updates: { externalId: string; scorecard: MatchScorecard }[] = [];

  console.log(`Parsing ${files.length} JSON files...`);
  
  for (const filename of files) {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    const doc = JSON.parse(raw) as CricsheetMatch;
    
    const info = doc.info;
    const isIPL = info.event?.name?.toLowerCase().includes("indian premier league");
    if (!isIPL) continue;

    const seasonYear = parseInt(String(info.season).substring(0, 4), 10);
    if (seasonYear >= 2026) continue;

    const rawHome = info.teams[0] || "Unknown";
    const rawAway = info.teams[1] || "Unknown";
    const matchDate = new Date(`${info.dates[0]}T00:00:00.000Z`);
    
    const externalId = buildUniformExternalId(matchDate, rawHome, rawAway);
    const scorecard = buildScorecard(doc);

    updates.push({ externalId, scorecard });
  }

  console.log(`✅ Computed ${updates.length} scorecards. Starting DB updates...`);

  let updatedCount = 0;
  for (const update of updates) {
    try {
      await prisma.match.update({
        where: { externalId: update.externalId },
        data: { scorecard: update.scorecard as any },
      });
      updatedCount++;
      if (updatedCount % 100 === 0) {
        console.log(`   Updated ${updatedCount}/${updates.length} matches...`);
      }
    } catch (e: unknown) {
      // If a match is not found (maybe the DB has missing dates), ignore gracefully
      if (e instanceof Error && (e as any).code !== "P2025") {
        console.error(`Error updating match ${update.externalId}:`, e);
      } else if (!(e instanceof Error)) {
        console.error(`Unknown error updating match ${update.externalId}:`, e);
      }
    }
  }

  console.log("\n==================================================");
  console.log("🚀 SCORECARD UPDATE COMPLETE");
  console.log(`   ✅ Successfully updated: ${updatedCount}`);
  console.log("==================================================");
}

run()
  .catch((e) => {
    console.error("❌ Fatal error:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
