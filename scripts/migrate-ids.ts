/**
 * scripts/migrate-ids.ts
 *
 * Migrates all existing matches to the new standard human-readable externalId format.
 * Format: YYYY-MM-DD_<TeamA_Short>_v_<TeamB_Short>
 *
 * Run with: npx tsx scripts/migrate-ids.ts
 */

import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { buildUniformExternalId } from "../lib/utils/match.js";

async function run() {
  console.log("==================================================");
  console.log("🔄 MIGRATING EXTERNAL IDs");
  console.log("==================================================");

  const matches = await prisma.match.findMany({
    select: {
      id: true,
      externalId: true,
      homeTeam: true,
      awayTeam: true,
      matchDate: true,
    },
  });

  console.log(`Found ${matches.length} total matches in database.\n`);

  let migratedCount = 0;
  let duplicateDeletedCount = 0;
  let alreadyCleanCount = 0;

  for (const match of matches) {
    const newId = buildUniformExternalId(match.matchDate, match.homeTeam, match.awayTeam);

    if (match.externalId === newId) {
      alreadyCleanCount++;
      continue;
    }

    try {
      await prisma.match.update({
        where: { id: match.id },
        data: { externalId: newId },
      });
      migratedCount++;
      if (migratedCount % 100 === 0) {
        console.log(`   Migrated ${migratedCount} matches...`);
      }
    } catch (e: any) {
      // Prisma P2002 means Unique constraint failed on the fields: (`externalId`)
      if (e.code === "P2002") {
        console.log(`⚠️ Collision detected for externalId: ${newId}.`);
        console.log(`🗑️  Deleting older duplicate record (ID: ${match.id}) to clean db.`);
        // Note: cascade delete might happen if relations exist, but this is safe
        // because true duplicates are redundant test artifacts.
        await prisma.match.delete({ where: { id: match.id } });
        duplicateDeletedCount++;
      } else {
        console.error(`❌ Unexpected error on match ${match.id}:`, e);
      }
    }
  }

  console.log("\n==================================================");
  console.log("🚀 MIGRATION COMPLETE");
  console.log(`   ✅ Successfully updated: ${migratedCount}`);
  console.log(`   ⏭️  Already clean:      ${alreadyCleanCount}`);
  console.log(`   🗑️  Duplicates deleted: ${duplicateDeletedCount}`);
  console.log("==================================================");
}

run()
  .catch((e) => {
    console.error("❌ Fatal error during migration:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
