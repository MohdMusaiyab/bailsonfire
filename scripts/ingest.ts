/**
 * scripts/ingest.ts
 *
 * THE FULL INGESTION PIPELINE — run this in production via cron.
 * For testing Stage 1 only (match fetch, no DB write), use test-ai.ts.
 *
 * Run with:
 *   npx tsx scripts/ingest.ts
 *
 * What this script does:
 *   1. Calls CricAPI (/v1/currentMatches + /v1/match_info) to find the latest
 *      completed IPL match. Early dedup inside the client skips the second
 *      API call entirely if the match is already in the DB.
 *   2. Validates the response with Zod.
 *   3. Uses the CricAPI match UUID as the externalId (programmatic, not AI-derived).
 *   4. Safety-net dedup check in the DB (covers race conditions between cron runs).
 *   5. If new: generates the roast via Gemini, then atomically writes Match + Summary.
 *   6. If duplicate: exits cleanly — no Gemini tokens wasted.
 */

import "dotenv/config";
import { ZodError } from "zod";
import { fetchRecentIPLMatch } from "../lib/ai/cricapi.js";
import { generateMatchRoast } from "../lib/ai/gemini.js";
import { AIResponseMatchSchema } from "../lib/validations/models.js";
import { prisma } from "../lib/prisma.js";

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------


async function runIngestion(): Promise<void> {
  console.log("==================================================");
  console.log("🏏 IPL ROAST AI — DB INGESTION PIPELINE");
  console.log("==================================================");

  if (!process.env.CRICEKT_DATA_API) {
    console.error("❌ CRICEKT_DATA_API is not set in your .env file.");
    process.exit(1);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is not set in your .env file (needed for roast generation).");
    process.exit(1);
  }

  try {
    // ── Stage 1: Fetch match data from CricAPI ──────────────────────────────
    // fetchRecentIPLMatch internally performs an early DB dedup check and will
    // return { matchFound: false } if the match is already saved — avoiding
    // the second API call and Gemini roast generation entirely.
    console.log("\n[1/5] Fetching latest completed IPL match from CricAPI...");
    const rawMatchData = await fetchRecentIPLMatch();

    if (!rawMatchData.matchFound) {
      console.log(
        "\n✅ No new completed IPL match found (none available or already ingested). Exiting."
      );
      return;
    }

    // ── Stage 2: Validate with Zod ───────────────────────────────────────────
    console.log("\n[2/5] Validating match data with Zod schema...");
    const validated = AIResponseMatchSchema.parse(rawMatchData);

    // Type narrowing — at this point we know matchFound === true
    if (!validated.matchFound) return;

    console.log(
      `     ✅ Valid: ${validated.homeTeam} vs ${validated.awayTeam} | ${validated.matchDate}`
    );

    // ── Stage 3: Resolve externalId ──────────────────────────────────────────
    // CricAPI passes its own UUID through the externalId field — use it directly.
    // Fall back to a slug only if somehow absent (should never happen).
    console.log("\n[3/5] Resolving externalId...");
    const externalId =
      validated.externalId ??
      `${validated.homeTeamShort.toLowerCase()}_${validated.awayTeamShort.toLowerCase()}_${validated.matchDate.split("T")[0]}`;
    console.log(`     externalId = "${externalId}"`);

    // ── Stage 4: Safety-net dedup (covers simultaneous cron runs) ────────────
    console.log("\n[4/5] Safety-net deduplication check...");
    const existingMatch = await prisma.match.findUnique({
      where: { externalId },
      select: { id: true, createdAt: true },
    });

    if (existingMatch) {
      console.log(
        `\n✅ DUPLICATE DETECTED — Match "${externalId}" was already ingested ` +
          `on ${existingMatch.createdAt.toISOString()}. Skipping roast generation.`
      );
      return;
    }

    console.log("     ✅ No duplicate found — proceeding with roast generation.");

    // ── Stage 5: Generate roast then write to DB atomically ──────────────────
    console.log("\n[5/5] Generating roast and writing to database...");

    const roastContent = await generateMatchRoast(validated);
    console.log("     ✅ Roast generated.");

    // Use a Prisma nested create — Match + Summary in a single round-trip.
    // The @unique constraint on externalId is the final DB-level safety net:
    // if two cron processes somehow ran simultaneously, Prisma will throw a
    // P2002 unique constraint violation on the second write, which is correct
    // behaviour — better a thrown error than a silent duplicate.
    const savedMatch = await prisma.match.create({
      data: {
        externalId,
        homeTeam: validated.homeTeam,
        awayTeam: validated.awayTeam,
        scoreSummary: validated.scoreSummary,
        venue: validated.venue,
        winner: validated.winner ?? null,
        loser: validated.loser ?? null,
        matchDate: new Date(validated.matchDate),
        scorecard: validated.scorecard ? (validated.scorecard as import("@prisma/client").Prisma.InputJsonValue) : undefined, // Save full scorecard JSON to DB
        // Nested create — Summary belongs to this Match, created atomically
        summaries: {
          create: {
            content: roastContent,
            aiModel: "gemini-2.5-flash / gemini-2.5-flash-lite",
          },
        },
      },
      // Only select what we need for the success log
      select: {
        id: true,
        externalId: true,
        homeTeam: true,
        awayTeam: true,
        createdAt: true,
      },
    });

    console.log("\n==================================================");
    console.log("✅ INGESTION COMPLETE");
    console.log("==================================================");
    console.log(`   Match ID  : ${savedMatch.id}`);
    console.log(`   ExternalId: ${savedMatch.externalId}`);
    console.log(`   Teams     : ${savedMatch.homeTeam} vs ${savedMatch.awayTeam}`);
    console.log(`   Saved at  : ${savedMatch.createdAt.toISOString()}`);
    console.log("\n── Roast Preview ─────────────────────────────────");
    console.log(roastContent);
    console.log("──────────────────────────────────────────────────");
  } catch (error: unknown) {
    console.error("\n❌ INGESTION FAILED");

    if (error instanceof ZodError) {
      console.error("Schema Validation Errors:");
      console.error(error.format());
    } else if (
      error instanceof Error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      // Prisma unique constraint violation — race condition between two cron runs
      console.error(
        "DB Unique Constraint Violation (P2002): A parallel ingestion process " +
          "already committed this match. This is safe — no duplicate was created."
      );
    } else {
      console.error(
        error instanceof Error ? error.message : String(error)
      );
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("\n[DB] Connection closed.");
  }
}

runIngestion();
