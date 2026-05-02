/**
 * scripts/ingest-live.ts
 *
 * Lightweight live ingestion pipeline — NO AI roast generation.
 * Fetches the latest completed IPL match from CricAPI and upserts
 * it into the DB with full scorecard data.
 *
 * Designed to be run by the GitHub Actions cron at 2 AM IST (20:30 UTC) daily.
 * Safe to run multiple times — idempotent upsert logic.
 *
 * Run manually: npx tsx scripts/ingest-live.ts
 */

import "dotenv/config";
import { fetchRecentIPLMatch } from "../lib/ai/cricapi.js";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

async function runLiveIngestion(): Promise<void> {
  console.log("==================================================");
  console.log("🏏 IPL LIVE INGESTION — MATCH + SCORECARD (NO ROAST)");
  console.log("==================================================");

  if (!process.env.CRICEKT_DATA_API) {
    console.error("❌ CRICEKT_DATA_API is not set in environment.");
    process.exit(1);
  }

  // ── Stage 1: Fetch latest completed IPL match from CricAPI ───────────────
  // fetchRecentIPLMatch handles the early DB dedup internally — it returns
  // { matchFound: false } if the match is already saved, avoiding the second
  // API call entirely.
  console.log("\n[1/3] Fetching latest completed IPL match from CricAPI...");
  const data = await fetchRecentIPLMatch();

  if (!data.matchFound) {
    console.log(
      "\n✅ No new match found — already ingested or none available yet. Exiting."
    );
    return;
  }

  // externalId is optional on the type but always set by fetchRecentIPLMatch.
  // Guard here to keep TS happy and catch any unexpected edge-case at runtime.
  if (!data.externalId) {
    console.error("❌ No externalId returned from CricAPI — cannot safely upsert. Exiting.");
    process.exit(1);
  }

  // Narrow to string — safe from this point on
  const externalId = data.externalId;

  console.log(
    `     ✅ Found: ${data.homeTeam} vs ${data.awayTeam} on ${data.matchDate}`
  );
  console.log(`     Score  : ${data.scoreSummary}`);
  console.log(`     Winner : ${data.winner ?? "Unknown / No result"}`);

  // ── Stage 2: Safety-net dedup (covers race conditions) ───────────────────
  console.log("\n[2/3] Safety-net deduplication check...");
  const existing = await prisma.match.findUnique({
    where: { externalId },
    select: { id: true, createdAt: true },
  });

  if (existing) {
    console.log(
      `     ✅ DUPLICATE — "${externalId}" already in DB ` +
        `(saved ${existing.createdAt.toISOString()}). Exiting.`
    );
    return;
  }

  console.log("     ✅ Not in DB — proceeding with upsert.");

  // ── Stage 3: Upsert to DB ─────────────────────────────────────────────────
  // Using upsert (not create) so that if a Cricsheet-seeded record already
  // exists with the same externalId, we enrich it rather than duplicate it.
  console.log("\n[3/3] Writing match + scorecard to DB...");

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
    select: {
      id:         true,
      externalId: true,
      homeTeam:   true,
      awayTeam:   true,
      createdAt:  true,
    },
  });

  console.log("\n==================================================");
  console.log("✅ INGESTION COMPLETE");
  console.log("==================================================");
  console.log(`   Match ID  : ${saved.id}`);
  console.log(`   ExternalId: ${saved.externalId}`);
  console.log(`   Teams     : ${saved.homeTeam} vs ${saved.awayTeam}`);
  console.log(`   Score     : ${data.scoreSummary}`);
  console.log(`   Winner    : ${data.winner ?? "Unknown"}`);
  console.log(`   MoM       : ${data.playerOfMatch ?? "N/A"}`);
  console.log(`   Saved at  : ${saved.createdAt.toISOString()}`);
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
