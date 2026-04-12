/**
 * STANDALONE AI TEST SCRIPT
 * This script demonstrates the 2-Stage "Chacha Ji" pipeline without touching the database.
 * Run with: npx tsx scripts/test-ai.ts
 */

import "dotenv/config";
import { fetchRecentMatchData, generateMatchRoast } from "../lib/ai/gemini.js";
import { AIResponseMatchSchema } from "../lib/validations/models.js";

async function testExtraction() {
  console.log("--------------------------------------------------");
  console.log("🏏 IPL ROAST AI - 2-STAGE PIPELINE TEST");
  console.log("--------------------------------------------------");

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is not set in your .env file.");
    process.exit(1);
  }

  try {
    // Stage 1: Get structured data
    const matchData = await fetchRecentMatchData();

    console.log("\n[1] STAGE 1: RAW AI MATCH DATA RECEIVED:");
    console.log(JSON.stringify(matchData, null, 2));

    // Validate using Zod (simulating exactly what the backend API would do)
    const validatedData = AIResponseMatchSchema.parse(matchData);

    if (!validatedData.matchFound) {
      console.log("\n✅ No recent match found within the last 24 hours.");
      return;
    }

    console.log("\n[2] VALIDATED DATA (ZOD SUCCESS):");
    console.log(`Match: ${validatedData.homeTeam} vs ${validatedData.awayTeam}`);
    // Simulate DB Check Deduplication here...
    const externalId = `${validatedData.homeTeamShort}_${validatedData.awayTeamShort}_${validatedData.matchDate.split("T")[0]}`;
    console.log(`\n(Simulated DB check for externalId generated: ${externalId}... new match found!)`);

    // Stage 2: Generate Roast based on facts
    const roast = await generateMatchRoast(validatedData);
    
    console.log("\n[3] STAGE 2: ROAST CHACHA JI GENERATED");
    console.log("-----------------------------------------");
    console.log(roast);
    console.log("-----------------------------------------");

    console.log("\n✅ TEST COMPLETED SUCCESSFULLY");
  } catch (error: unknown) {
    console.error("\n❌ TEST FAILED");
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      console.error("Schema Validation Error:", (error as any).errors);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exit(1);
  }
}

testExtraction();
