/**
 * STANDALONE DATABASE INGESTION SCRIPT
 * Run with: npx tsx scripts/ingest.ts
 *
 * This script runs the Two-Stage AI Pipeline, checks for duplicates using
 * programmatic externalId, and writes safely to the Prisma database.
 */

import "dotenv/config";
import { ZodError } from "zod";
import { fetchRecentMatchData, generateMatchRoast } from "../lib/ai/gemini.js";
import { AIResponseMatchSchema } from "../lib/validations/models.js";
import { prisma } from "../lib/prisma.js";

async function runIngestion() {
  console.log("--------------------------------------------------");
  console.log("🏏 IPL ROAST AI - DB INGESTION PIPELINE STARTED");
  console.log("--------------------------------------------------");

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  try {
    // Stage 1: Get structured data
    console.log("[1] Calling Stage 1: Fetching Match Stats...");
    const matchData = await fetchRecentMatchData();

    if (!matchData.matchFound) {
      console.log("\n✅ No recent match found within the last 24 hours. Exiting quietly.");
      return;
    }

    // Validate using Zod
    const validatedData = AIResponseMatchSchema.parse(matchData);
    if (!validatedData.matchFound) return; // For TS narrowing

    // Generate programmatic externalId ensuring uniqueness: TEAM1_TEAM2_YYYY-MM-DD
    // Sort team shorts alphabetically so RCB vs KKR is always KKR_RCB to avoid duplicate inverses
    const sortedTeams = [validatedData.homeTeamShort, validatedData.awayTeamShort].sort();
    const dateOnly = validatedData.matchDate.split("T")[0];
    const generatedExternalId = `${sortedTeams[0]}_${sortedTeams[1]}_${dateOnly}`;

    console.log(`\n[2] Validated Data Success: ${validatedData.homeTeam} vs ${validatedData.awayTeam}`);
    console.log(`Checking Database for existing Match ID: ${generatedExternalId}`);

    const existingMatch = await prisma.match.findUnique({
      where: { externalId: generatedExternalId }
    });

    if (existingMatch) {
      console.log(`\n✅ Match ${generatedExternalId} already exists in Database. Skipping Roast Generation to save API tokens.`);
      return;
    }

    // Stage 2: Generate Roast based on facts
    console.log("\n[3] Calling Stage 2: Generating 'Chacha Ji' Roast...");
    const roastContent = await generateMatchRoast(validatedData);

    console.log("\n[4] Writing to Database...");
    
    // Write atomically utilizing Prisma transactions or nested writes
    const savedMatch = await prisma.match.create({
      data: {
        externalId: generatedExternalId,
        homeTeam: validatedData.homeTeam,
        awayTeam: validatedData.awayTeam,
        scoreSummary: validatedData.scoreSummary,
        venue: validatedData.venue,
        winner: validatedData.winner,
        loser: validatedData.loser,
        matchDate: new Date(validatedData.matchDate),
        summaries: {
          create: {
            content: roastContent,
            aiModel: "gemini-2.5-flash-lite",
          }
        }
      }
    });

    console.log(`\n✅ SUCCESSFULLY SAVED: Match ID ${savedMatch.id} with Summary!`);
    console.log("-----------------------------------------");
    console.log(roastContent);
    console.log("-----------------------------------------");

  } catch (error: unknown) {
    console.error("\n❌ INGESTION FAILED");
    if (error instanceof ZodError) {
      console.error("Schema Validation Error:", error.format());
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runIngestion();
