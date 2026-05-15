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
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    const baseDelay = 5000; // 5 seconds

    while (attempts < MAX_ATTEMPTS) {
      try {
        // Reconstruct the payload expected by generateMatchRoast
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

        // Save to DB immediately
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
        break; // Exit retry loop on success
      } catch (err: any) {
        attempts++;
        const isRateLimit = err.status === 429 || err.message?.includes("429") || err.message?.includes("Quota exceeded");
        
        if (isRateLimit && attempts < MAX_ATTEMPTS) {
          const delay = Math.min(baseDelay * Math.pow(2, attempts - 1), 60000);
          console.warn(`   ⚠️ Rate limit hit. Retrying in ${delay / 1000}s... (Attempt ${attempts}/${MAX_ATTEMPTS})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`   ❌ Failed to generate roast for ${match.externalId}:`, err.message || err);
          console.log(`   ⏭️ Skipping to next...\n`);
          break; // Exit retry loop on fatal error
        }
      }
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
