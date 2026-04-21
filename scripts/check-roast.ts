/**
 * scripts/check-roast.ts
 *
 * Utility script to test Gemini roast generation against a random historical match.
 * DOES NOT save anything to the database. Useful for tweaking the prompt.
 *
 * Run with: npx tsx scripts/check-roast.ts
 */

import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { generateMatchRoast } from "../lib/ai/gemini.js";
import { type AIResponseMatchPayload } from "../lib/validations/models.js";

async function run() {
  console.log("==================================================");
  console.log("🔥 ROAST PROMPT TESTER");
  console.log("==================================================");

  // 1. Fetch a random match from before 2026 that has a scorecard
  // We use Prisma's raw query to cleanly grab a random row.
  const randomMatches = await prisma.$queryRaw<Array<any>>`
    SELECT * FROM "Match" 
    WHERE "matchDate" < '2026-01-01'::date 
      AND "scorecard" IS NOT NULL
    ORDER BY RANDOM() 
    LIMIT 1;
  `;

  if (!randomMatches || randomMatches.length === 0) {
    console.error("❌ No historical matches found with scorecards.");
    process.exit(1);
  }

  const match = randomMatches[0];

  console.log(`\n🎯 Selected Match: ${match.homeTeam} vs ${match.awayTeam}`);
  console.log(`📅 Date: ${new Date(match.matchDate).toISOString().split("T")[0]}`);
  console.log(`🏟️ Venue: ${match.venue}`);
  console.log(`🏆 Result: ${match.winner ? `${match.winner} won` : "Draw/Unknown"}`);

  // 2. Map DB match to the AI Payload format
  // We don't have homeTeamShort / awayTeamShort in the DB directly, so we just use a slice for the test payload.
  const payload: Extract<AIResponseMatchPayload, { matchFound: true }> = {
    matchFound: true,
    externalId: match.externalId,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeTeamShort: match.homeTeam.substring(0, 3).toUpperCase(),
    awayTeamShort: match.awayTeam.substring(0, 3).toUpperCase(),
    scoreSummary: match.scoreSummary,
    matchStatus: match.winner ? `${match.winner} won the match` : "Match tied/abandoned",
    venue: match.venue,
    winner: match.winner,
    loser: match.loser,
    matchDate: new Date(match.matchDate).toISOString(),
    scorecard: typeof match.scorecard === "string" ? JSON.parse(match.scorecard) : match.scorecard,
  };

  console.log("\n🤖 Generating roast... (this may take a few seconds)");
  
  try {
    const roast = await generateMatchRoast(payload);
    console.log("\n==================================================");
    console.log("🔥 GENERATED ROAST");
    console.log("==================================================");
    console.log(roast);
    console.log("\n==================================================");
  } catch (err) {
    console.error("\n❌ Error generating roast:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
