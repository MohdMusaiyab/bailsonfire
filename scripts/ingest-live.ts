/**
 * scripts/ingest-live.ts
 *
 * Lightweight live ingestion pipeline — NO AI roast generation.
 * Fetches ALL completed IPL matches from CricAPI that aren't in the DB
 * and upserts them with full scorecard data.
 *
 * Designed to be run by the GitHub Actions cron at 2 AM IST (20:30 UTC) daily.
 * Safe to run multiple times — idempotent upsert logic.
 *
 * Run manually: npx tsx scripts/ingest-live.ts
 */

import "dotenv/config";
import { fetchNewIPLMatches } from "../lib/ai/cricapi.js";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

async function runLiveIngestion(): Promise<void> {
  console.log("==================================================");
  console.log("🏏 IPL LIVE BATCH INGESTION — MATCH + SCORECARD");
  console.log("==================================================");

  if (!process.env.CRICEKT_DATA_API) {
    console.error("❌ CRICEKT_DATA_API is not set in environment.");
    process.exit(1);
  }

  // ── Stage 1: Fetch ALL new completed IPL matches ──────────────────────────
  console.log("\n[1/2] Checking CricAPI for new completed IPL matches...");
  const newMatches = await fetchNewIPLMatches();

  if (newMatches.length === 0) {
    console.log("\n✅ No new matches found — everything is up to date. Exiting.");
    return;
  }

  console.log(`\n[2/2] Processing ${newMatches.length} new match(es)...`);

  let successCount = 0;

  for (const data of newMatches) {
    const externalId = data.externalId;
    console.log(`\n📄 Ingesting: ${data.homeTeam} vs ${data.awayTeam}`);
    console.log(`   ID: ${externalId}`);
    
    try {
      const saved = await prisma.match.upsert({
        where: { externalId },
        create: {
          externalId,
          homeTeam:         data.homeTeam,
          awayTeam:         data.awayTeam,
          scoreSummary:     data.scoreSummary,
          venue:            data.venue,
          winner:           data.winner   ?? null,
          loser:            data.loser    ?? null,
          matchDate:        new Date(data.matchDate),
          scorecard:        data.scorecard as Prisma.InputJsonValue,
          playerOfTheMatch: data.playerOfMatch ?? null,
          keyMoments:       [],
        },
        update: {
          scoreSummary:     data.scoreSummary,
          scorecard:        data.scorecard as Prisma.InputJsonValue,
          venue:            data.venue,
          playerOfTheMatch: data.playerOfMatch ?? null,
        },
      });

      console.log(`   ✅ SUCCESS: Match ${saved.id} upserted.`);
      successCount++;
    } catch (err) {
      console.error(`   ❌ FAILED to ingest ${externalId}:`, err);
    }
  }

  console.log("\n==================================================");
  console.log("✅ BATCH INGESTION COMPLETE");
  console.log(`   Total New Matches Found: ${newMatches.length}`);
  console.log(`   Successfully Ingested  : ${successCount}`);
  console.log("==================================================");
}

runLiveIngestion()
  .catch((e) => {
    console.error("\n❌ Fatal error during live ingestion:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\n[DB] Connection closed.");
  });
