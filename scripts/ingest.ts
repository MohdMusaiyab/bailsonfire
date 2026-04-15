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
 *   1. Calls Gemini (Google Search grounded) to find the latest completed
 *      IPL match within the last 48 hours (IST-relative).
 *   2. Validates the response with Zod.
 *   3. Generates a deterministic externalId from the match data — NOT from AI.
 *      Format: "<lower>_<upper>_<YYYY-MM-DD>"  (team shorts sorted A→Z + IST date)
 *      Example: "lsg_rcb_2026-04-15"
 *   4. Checks the DB for an existing match with that externalId (deduplication).
 *   5. If new: generates the roast, then atomically writes Match + Summary to DB.
 *   6. If duplicate: exits cleanly — no tokens wasted on the roast call.
 */

import "dotenv/config";
import { ZodError } from "zod";
import { fetchRecentMatchData, generateMatchRoast } from "../lib/ai/gemini.js";
import { AIResponseMatchSchema } from "../lib/validations/models.js";
import { prisma } from "../lib/prisma.js";

// ---------------------------------------------------------------------------
// externalId generator
// ---------------------------------------------------------------------------

/**
 * Builds a deterministic, collision-safe external ID for deduplication.
 *
 * Design decisions:
 * - Team shorts are sorted alphabetically so "RCB vs LSG" and "LSG vs RCB"
 *   always produce the same key — prevents inverse-duplicate entries.
 * - We extract the date from the IST matchDate string, NOT from the AI's
 *   description, so the key is always canonical and machine-generated.
 * - Lowercased and hyphen-joined for readability and URL-safety.
 *
 * Example: homeTeamShort="RCB", awayTeamShort="LSG", matchDate="2026-04-15T00:00:00.000Z"
 *          → "lsg_rcb_2026-04-15"
 */
function buildExternalId(
  homeTeamShort: string,
  awayTeamShort: string,
  matchDate: string // ISO 8601, e.g. "2026-04-15T00:00:00.000Z"
): string {
  const [lower, upper] = [
    homeTeamShort.toLowerCase(),
    awayTeamShort.toLowerCase(),
  ].sort(); // alphabetical sort = order-independent

  const dateOnly = matchDate.split("T")[0]; // "2026-04-15"

  return `${lower}_${upper}_${dateOnly}`;
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

async function runIngestion(): Promise<void> {
  console.log("==================================================");
  console.log("🏏 IPL ROAST AI — DB INGESTION PIPELINE");
  console.log("==================================================");

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is not set in your .env file.");
    process.exit(1);
  }

  try {
    // ── Stage 1: Fetch match data from Gemini (Google Search grounded) ──────
    console.log("\n[1/5] Fetching latest completed IPL match from Gemini...");
    const rawMatchData = await fetchRecentMatchData();

    if (!rawMatchData.matchFound) {
      console.log(
        "\n✅ No completed match found in the last 48 hours. Nothing to ingest. Exiting."
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

    // ── Stage 3: Build externalId (programmatically — never trust AI for this) ─
    console.log("\n[3/5] Generating externalId...");
    const externalId = buildExternalId(
      validated.homeTeamShort,
      validated.awayTeamShort,
      validated.matchDate
    );
    console.log(`     externalId = "${externalId}"`);

    // ── Stage 4: Deduplication check ─────────────────────────────────────────
    console.log("\n[4/5] Checking database for existing match...");
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
