import { GoogleGenerativeAI } from "@google/generative-ai";
import { type AIResponseMatchPayload } from "../validations/models.js";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const roastModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  tools: [
    {
      // @ts-expect-error - Google Search tool syntax for the @google/generative-ai SDK
      googleSearch: {},
    },
  ],
});

const DATA_FETCH_PROMPT = `
You are a cricket data extraction agent.
Search for the most recent completed IPL match (within the last 24 hours).
Return ONLY a JSON object with this exact schema:

{
  "matchFound": boolean,
  "homeTeam": "string",
  "awayTeam": "string",
  "scoreSummary": "string", // (e.g., "CSK 180/4 beat RCB 178/8")
  "venue": "string",
  "winner": "string",
  "loser": "string",
  "playerOfTheMatch": "string",
  "keyMoments": ["string", "string"], // (at least 2 specific match events)
  "matchDate": "ISO8601 Date String",
  "externalId": "string" // (unique identifier e.g. "RCB_vs_KKR_2026-04-05")
}

If no completed match found in last 24 hours, return { "matchFound": false }.
`;

export async function fetchRecentMatchData(): Promise<AIResponseMatchPayload> {
  console.log("[GEMINI] Fetching recent IPL match data...");
  const result = await roastModel.generateContent({
    contents: [{ role: "user", parts: [{ text: DATA_FETCH_PROMPT }] }]
  });

  let responseText = result.response.text();
  
  // Clean markdown if present
  if (responseText.includes("```json")) {
      responseText = responseText.split("```json")[1].split("```")[0];
  } else if (responseText.includes("```")) {
      responseText = responseText.split("```")[1].split("```")[0];
  }

  return JSON.parse(responseText.trim());
}

const ROAST_PROMPT = `
You are a world-class, cynical sports columnist known for your dry, razor-sharp wit and absolute lack of empathy for sporting mediocrity. 

TASK:
Based on the provided match data, write a devastatingly sarcastic post-match summary (150-200 words).

STRICT STYLE GUIDELINES:
1. LANGUAGE: Use PURE, sophisticated English. Employ high-level vocabulary to mock the absurdity of the performance (e.g., "shambolic," "existential crisis," "pedestrian," "unintentional comedy").
2. THE TONE: Deadpan, condescending, and hyper-sarcastic. You aren't angry; you are "intellectually offended" by the lack of competence shown on the field.
3. THE CRITIQUE: Focus on the gap between professional expectations and the actual display. Reference specific player names and their specific failures (expensive overs, slow strike rates, or comical fielding). 
4. THE "SALARY" ANGLE: Occasionally contrast their massive professional standing with their "amateur-hour" output. 
5. NO TOXICITY: Avoid personal insults or hate speech. The sarcasm must stay strictly within the realm of "sporting failure."

OUTPUT: Plain text only. No emojis, no hashtags, no slang.
`;

export async function generateMatchRoast(matchData: Extract<AIResponseMatchPayload, { matchFound: true }>) {
  console.log(`[GEMINI] Generating roast for ${matchData.homeTeam} vs ${matchData.awayTeam}...`);
  const result = await roastModel.generateContent({
    contents: [
      { role: "user", parts: [{ text: ROAST_PROMPT + "\n\nMatch Data:\n" + JSON.stringify(matchData) }] }
    ],
  });

  return result.response.text().trim();
}
