/**
 * scripts/check-roast.ts
 *
 * Roast quality tester — fetches the LATEST match from the DB (by matchDate),
 * runs it through the Gemini prompt, and prints everything to the console.
 *
 * DOES NOT save anything to the database. Use this to:
 *  - Tweak the Gemini prompt and see the output quality immediately.
 *  - Verify the scorecard data being fed to the AI is correctly structured.
 *
 * Run with: npx tsx scripts/check-roast.ts
 */

import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { generateMatchRoast } from "../lib/ai/gemini.js";
import { type AIResponseMatchPayload } from "../lib/validations/models.js";
import { getTeamShortName } from "../lib/utils/match.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Look up the short name from the shared mapping; fall back to a 3-char slice. */
function resolveShortName(fullName: string): string {
  return getTeamShortName(fullName);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  console.log("==================================================");
  console.log("🔥 ROAST QUALITY TESTER — LATEST DB MATCH");
  console.log("==================================================");

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not set in .env — cannot generate roast.");
    process.exit(1);
  }

  // 1. Fetch the single most-recent match from the DB
  const match = await prisma.match.findFirst({
    orderBy: { matchDate: "desc" },
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
    console.error("❌ No matches found in the database.");
    process.exit(1);
  }

  // 2. Print what we found
  console.log("\n🎯 Latest Match:");
  console.log(`   Teams   : ${match.homeTeam} vs ${match.awayTeam}`);
  console.log(`   Date    : ${match.matchDate.toISOString().split("T")[0]}`);
  console.log(`   Venue   : ${match.venue}`);
  console.log(`   Score   : ${match.scoreSummary}`);
  console.log(`   Winner  : ${match.winner ?? "Unknown"}`);
  console.log(`   MoM     : ${match.playerOfTheMatch ?? "N/A"}`);
  console.log(`   ID      : ${match.externalId}`);

  // 3. Print the raw scorecard JSON so you can verify the structure
  console.log("\n📊 Scorecard (raw from DB):");
  if (match.scorecard) {
    const sc =
      typeof match.scorecard === "string"
        ? JSON.parse(match.scorecard)
        : match.scorecard;

    const innings: Array<{ team: string; total: number; wickets: number; overs: number; batting: unknown[]; bowling: unknown[] }> =
      sc?.innings ?? [];

    if (innings.length === 0) {
      console.log("   ⚠️  Scorecard exists but innings array is empty.");
    } else {
      innings.forEach((inn, i) => {
        console.log(`\n   Inning ${i + 1}: ${inn.team} — ${inn.total}/${inn.wickets} (${inn.overs} ov)`);
        console.log(`   Batting rows : ${inn.batting?.length ?? 0}`);
        console.log(`   Bowling rows : ${inn.bowling?.length ?? 0}`);
      });
    }
  } else {
    console.log("   ⚠️  No scorecard data (null) — the AI will work with score summary only.");
  }

  // 4. Build the payload
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
  };

  console.log("\n🤖 Sending to Gemini for roast generation...");

  try {
    const roast = await generateMatchRoast(payload);

    console.log("\n==================================================");
    console.log("🔥 GENERATED ROAST");
    console.log("==================================================");
    console.log(roast);
    console.log("==================================================");
    console.log(`\n📏 Roast length: ${roast.length} characters`);
    console.log("✅ No changes saved to the database.");
  } catch (err) {
    console.error("\n❌ Error generating roast:", err);
  } finally {
    await prisma.$disconnect();
    console.log("[DB] Connection closed.");
  }
}

run();
