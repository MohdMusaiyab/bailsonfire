/**
 * scripts/addroast.ts
 *
 * Dedicated script to heal matches missing AI roasts.
 * Picks the latest 5 matches without a summary, generates the roast,
 * and saves it to the DB sequentially.
 */

import "dotenv/config";
import { generateMatchRoast } from "../lib/ai/gemini.js";
import { prisma } from "../lib/prisma.js";
import { getTeamShortName } from "../lib/utils/match.js";
import { type AIResponseMatchPayload, type MatchScorecard } from "../lib/validations/models.js";

async function runAddRoast(): Promise<void> {
  console.log("==================================================");
  console.log("🔥 ROAST HEALER — GENERATING MISSING SUMMARIES");
  console.log("==================================================");

  // Find up to 5 latest matches that don't have a summary
  const matchesWithoutRoast = await prisma.match.findMany({
    where: {
      summaries: {
        none: {},
      },
    },
    orderBy: {
      matchDate: "desc",
    },
    take: 5,
  });

  if (matchesWithoutRoast.length === 0) {
    console.log("\n✅ All matches have roasts. Nothing to heal.");
    return;
  }

  console.log(`\nFound ${matchesWithoutRoast.length} match(es) missing a roast. Processing sequentially...\n`);

  let successCount = 0;

  for (const match of matchesWithoutRoast) {
    console.log(`▶️ Generating missing roast for ${match.homeTeam} vs ${match.awayTeam} (${match.externalId})`);
    try {
      // Reconstruct the payload expected by generateMatchRoast without using 'any'
      const payload: Extract<AIResponseMatchPayload, { matchFound: true }> = {
        matchFound: true,
        externalId: match.externalId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeTeamShort: getTeamShortName(match.homeTeam),
        awayTeamShort: getTeamShortName(match.awayTeam),
        venue: match.venue,
        scoreSummary: match.scoreSummary,
        playerOfMatch: match.playerOfTheMatch,
        matchDate: match.matchDate.toISOString(),
        scorecard: match.scorecard as MatchScorecard | undefined,
      };

      const { headline, roast } = await generateMatchRoast(payload);

      // Save to DB immediately to avoid token loss if a subsequent one fails
      await prisma.summary.create({
        data: {
          matchId: match.id,
          headline: headline,
          content: roast,
          aiModel: "gemini-2.0-flash-lite", 
        },
      });

      console.log(`   ✨ Success! Saved: "${headline}"\n`);
      successCount++;
    } catch (err) {
      console.error(`   ⚠️ Failed to generate roast for ${match.externalId}:`, err);
      console.log(`   ⏭️ Skipping to next...\n`);
    }
  }

  console.log("==================================================");
  console.log("✅ HEALING COMPLETE");
  console.log(`   Successfully generated and saved: ${successCount} / ${matchesWithoutRoast.length}`);
  console.log("==================================================");
}

runAddRoast()
  .catch((e) => {
    console.error("\n❌ Fatal error during addroast:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\n[DB] Connection closed.");
  });
