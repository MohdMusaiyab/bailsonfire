/**
 * lib/ai/gemini.ts
 *
 * AI client using the official @google/genai SDK.
 *
 * Stage 1 — fetchRecentMatchData:
 *   Uses Google Search grounding to find the latest completed IPL match
 *   within the last 48 hours, relative to the current IST time.
 *   Returns a validated, typed `AIResponseMatchPayload`.
 *
 * Stage 2 — generateMatchRoast:
 *   Takes structured match data and produces a sarcastic roast summary.
 *   Does NOT use search grounding (facts are already known).
 */

import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import { type AIResponseMatchPayload } from "../validations/models.js";
import { TEAM_LORE } from "./teamPoints.js";

// ---------------------------------------------------------------------------
// Client setup
// ---------------------------------------------------------------------------

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "[GEMINI] Missing GEMINI_API_KEY — set it in your .env file."
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Use a model with Google Search grounding support for data fetch.
// Roast generation does not need search; use the lighter model to save tokens.
const FETCH_MODEL = "gemini-2.5-flash";
const ROAST_MODEL = "gemini-2.5-flash-lite";

// ---------------------------------------------------------------------------
// Retry configuration
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 2000; // doubles each attempt: 2s → 4s → 8s

// ---------------------------------------------------------------------------
// IST context helper
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable IST timestamp string injected into the prompt.
 * This is critical: without it, Gemini may use UTC and produce an off-by-one
 * date error near the IST midnight crossover (12:30 AM IST = 7 PM UTC prev day).
 */
function buildISTContext(): string {
  const now = new Date();

  const humanReadable = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // YYYY-MM-DD in IST (used as a reference anchor for the model)
  const dateIST = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return `${humanReadable} [${dateIST} IST]`;
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildDataFetchPrompt(): string {
  const istContext = buildISTContext();

  return `
You are a cricket data extraction agent with access to Google Search.

=== CURRENT TIME (ALWAYS USE THIS FOR DATE REASONING) ===
${istContext}
All dates and times MUST be calculated relative to the IST time above.
Do NOT use UTC. IST is UTC+5:30.

=== YOUR TASK ===
Search Google for the most recently COMPLETED IPL 2026 match played within
the last 48 hours (relative to the IST time above).

=== STRICT RULES ===
1. ONLY return a match that is 100% FINISHED:
   - The final ball of the last over has been bowled.
   - The official winner has been declared.
2. IGNORE matches that are:
   - Currently LIVE or ONGOING.
   - INTERRUPTED (rain, DLS method pending, etc.) with no final result yet.
   - Scheduled in the FUTURE.
3. The "matchDate" field MUST be the calendar date in IST on which the
   match was played, formatted exactly as: "YYYY-MM-DDT00:00:00.000Z".
   Example: A match played on 15 April 2026 IST → "2026-04-15T00:00:00.000Z"
4. Do NOT include individual player names, "Player of the Match" details,
   or individual batting/bowling figures.
5. If no completed match exists within the last 48 hours → return the
   fallback below, nothing else.

=== OUTPUT FORMAT ===
Return ONLY a valid JSON object. Absolutely NO markdown formatting,
NO code blocks (no \`\`\`), NO explanatory text — pure raw JSON only.

If a completed match was found:
{
  "matchFound": true,
  "homeTeam": "Full official team name (e.g., Royal Challengers Bengaluru)",
  "awayTeam": "Full official team name (e.g., Mumbai Indians)",
  "homeTeamShort": "Abbreviation (e.g., RCB)",
  "awayTeamShort": "Abbreviation (e.g., MI)",
  "scoreSummary": "e.g., RCB 187/4 (20 ov) beat MI 183/6 (20 ov) by 4 runs",
  "venue": "Full stadium and city (e.g., M. Chinnaswamy Stadium, Bengaluru)",
  "winner": "Full name of the winning team",
  "loser": "Full name of the losing team",
  "matchDate": "YYYY-MM-DDT00:00:00.000Z"
}

If NO completed match was found in the last 48 hours:
{"matchFound": false}
`.trim();
}

// ---------------------------------------------------------------------------
// Response parsing utilities
// ---------------------------------------------------------------------------

/**
 * Strips markdown code fences that Gemini sometimes wraps around JSON,
 * then extracts the first JSON object found in the text.
 * Throws if no valid JSON object can be isolated.
 */
function extractJSONString(raw: string): string {
  let text = raw.trim();

  // Strip ```json ... ``` or ``` ... ```
  if (text.startsWith("```")) {
    const firstNewline = text.indexOf("\n");
    text = firstNewline !== -1 ? text.slice(firstNewline + 1) : text.slice(3);
  }
  if (text.endsWith("```")) {
    text = text.slice(0, -3).trimEnd();
  }
  text = text.trim();

  // Attempt to pull out the first JSON object (handles trailing prose)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  throw new Error(
    `No JSON object found in model response. Raw (first 400 chars): ${raw.slice(0, 400)}`
  );
}

/**
 * Parses the raw model text into a typed `AIResponseMatchPayload`.
 * Performs field-level validation so callers never receive junk data.
 * Throws descriptive errors for any structural issue — the retry loop
 * will catch these and try again.
 */
function parseMatchPayload(raw: string): AIResponseMatchPayload {
  const jsonString = extractJSONString(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (cause) {
    throw new Error(
      `JSON.parse failed. Extracted string: ${jsonString.slice(0, 400)}`,
      { cause }
    );
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Parsed value is not a plain object: ${typeof parsed}`);
  }

  const obj = parsed as Record<string, unknown>;

  // Handle the "no match" case first
  if (obj["matchFound"] === false) {
    return { matchFound: false };
  }

  if (obj["matchFound"] !== true) {
    throw new Error(
      `Unexpected "matchFound" value: ${JSON.stringify(obj["matchFound"])}. ` +
        `Expected true or false.`
    );
  }

  // Validate all required string fields
  const requiredFields = [
    "homeTeam",
    "awayTeam",
    "homeTeamShort",
    "awayTeamShort",
    "scoreSummary",
    "venue",
    "matchDate",
  ] as const;

  for (const field of requiredFields) {
    const value = obj[field];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(
        `Field "${field}" is missing or empty. Got: ${JSON.stringify(value)}`
      );
    }
  }

  // Validate matchDate is a plausible ISO 8601 date string
  const matchDate = obj["matchDate"] as string;
  if (!/^\d{4}-\d{2}-\d{2}T/.test(matchDate)) {
    throw new Error(
      `Field "matchDate" does not look like an ISO 8601 date: "${matchDate}"`
    );
  }

  return {
    matchFound: true,
    homeTeam: obj["homeTeam"] as string,
    awayTeam: obj["awayTeam"] as string,
    homeTeamShort: obj["homeTeamShort"] as string,
    awayTeamShort: obj["awayTeamShort"] as string,
    scoreSummary: obj["scoreSummary"] as string,
    venue: obj["venue"] as string,
    winner: typeof obj["winner"] === "string" ? obj["winner"] : null,
    loser: typeof obj["loser"] === "string" ? obj["loser"] : null,
    matchDate,
  };
}

// ---------------------------------------------------------------------------
// Grounding metadata logger
// ---------------------------------------------------------------------------

/**
 * Logs the Google Search queries and sources Gemini actually used.
 * Helps with debugging — when you run test-ai.ts you can see exactly
 * what it searched for and which pages it cited.
 */
function logGroundingMetadata(response: GenerateContentResponse): void {
  const candidate = response.candidates?.[0];
  const meta = candidate?.groundingMetadata;

  if (!meta) {
    console.warn(
      "[GEMINI] ⚠️  No grounding metadata found — " +
        "response may not have used Google Search."
    );
    return;
  }

  const queries = meta.webSearchQueries;
  if (queries && queries.length > 0) {
    console.log("[GEMINI] 🔎 Google Search queries used by the model:");
    queries.forEach((q, i) => console.log(`         ${i + 1}. "${q}"`));
  }

  const chunks = meta.groundingChunks;
  if (chunks && chunks.length > 0) {
    console.log(
      `[GEMINI] 📄 Grounded against ${chunks.length} source(s):`
    );
    chunks.slice(0, 5).forEach((chunk, i) => {
      const web = chunk.web;
      if (web?.uri) {
        console.log(`         ${i + 1}. ${web.title ?? "Untitled"} → ${web.uri}`);
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Sleep helper
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Stage 1: Fetch match data (exported)
// ---------------------------------------------------------------------------

/**
 * Calls Gemini with Google Search grounding to find the most recently
 * completed IPL match within the last 48 hours (IST-relative).
 *
 * Retries up to MAX_RETRIES times with exponential backoff if the model
 * returns an unparseable or structurally invalid response.
 *
 * @returns A typed `AIResponseMatchPayload` — always `{ matchFound: false }`
 *          or a fully-populated match object. Never throws unexpectedly.
 */
export async function fetchRecentMatchData(): Promise<AIResponseMatchPayload> {
  const prompt = buildDataFetchPrompt();
  let lastError: Error = new Error("No attempts made.");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(
      `\n[GEMINI] ── Attempt ${attempt}/${MAX_RETRIES}: fetching IPL match data ──`
    );

    try {
      const response = await ai.models.generateContent({
        model: FETCH_MODEL,
        contents: prompt,
        config: {
          // Google Search grounding — gives the model live web access
          tools: [{ googleSearch: {} }],
          // temperature 1.0 is recommended by Google for grounded responses
          temperature: 1.0,
        },
      });

      // Always log what was searched and which sources were used
      logGroundingMetadata(response);

      const rawText = response.text;

      if (!rawText || rawText.trim() === "") {
        throw new Error("Model returned an empty response body.");
      }

      console.log("[GEMINI] Raw text received (first 500 chars):");
      console.log("         " + rawText.slice(0, 500).replace(/\n/g, "\n         "));

      const payload = parseMatchPayload(rawText);

      if (payload.matchFound) {
        console.log(
          `[GEMINI] ✅ Match extracted: ${payload.homeTeam} vs ${payload.awayTeam} ` +
            `on ${payload.matchDate}`
        );
      } else {
        console.log(
          "[GEMINI] ✅ Model confirmed: no completed match in the last 48 hours."
        );
      }

      return payload;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[GEMINI] ❌ Attempt ${attempt} failed: ${lastError.message}`);

      if (attempt < MAX_RETRIES) {
        const delay = BASE_RETRY_DELAY_MS * attempt; // 2s, 4s, 6s
        console.log(`[GEMINI] ⏳ Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `[GEMINI] All ${MAX_RETRIES} attempts exhausted. ` +
      `Last error: ${lastError.message}`
  );
}

/**
 * Filters and retrieves lore that is historically accurate for the match year.
 * Ensures a roast for an older match doesn't accidentally mention future events.
 */
function getEraAppropriateLore(teamShort: string, matchYear: number): string {
  const team = TEAM_LORE.find(t => 
    t.shortName === teamShort || 
    t.previousNames.some(prev => prev.includes(teamShort))
  );
  if (!team) return "No specific historical baggage found.";

  const history: string[] = [`Overall Reputation: ${team.generalRoastPoint}`];

  team.yearWiseTrolls.forEach(era => {
    const eraYearMatch = String(era.year).match(/\d{4}/);
    if (eraYearMatch) {
      const eraStartYear = parseInt(eraYearMatch[0]);
      // Only include context that had actually happened by the time of the match
      if (eraStartYear <= matchYear) {
        history.push(`[Context from ${era.year}]: ${era.points.join(" ")}`);
      }
    }
  });

  return history.join("\n");
}

// ---------------------------------------------------------------------------
// Stage 2: Generate roast (exported — uses lighter model, no search needed)
// ---------------------------------------------------------------------------
const ROAST_PROMPT = `
You are a comical cricket writer with zero loyalty, maximum sarcasm, and a PhD in "Burning bridges". Your specialty is tearing apart BOTH IPL franchises in a match with brutal, everyday sarcasm that aims for a smirk or a guilty laugh.

=== YOUR OBJECTIVE ===
Craft exactly ONE dense paragraph of pure, modern sarcasm roasting the ENTIRE MATCH. Do NOT just roast the losing team—roast the winning team for how lucky or pathetic they were while winning. Weave actual scorecard facts with their historical franchise trauma.

=== TONE AND VOCABULARY (CRITICAL) ===
- USE SIMPLE, MODERN ENGLISH: Speak like a savage cricket fan on social media. DO NOT use fancy, complex, or "Shakespearean" words.
- EXAGGERATE RELENTLESSLY: Compare scores to bus numbers, batting collapses to origami, and fielding to sleepwalking.
- GROUP-BASED HUMOR: Mock the batting unit, bowling attack, or management as a collective. Use phrases like "the entire top order," "their so-called finishers," or "the franchise DNA."

=== THE ROASTING FORMULA ===
1. THE HOOK: Open with a brutal one-liner summarizing the overall clown-show of the match, dragging BOTH teams through the mud.
2. THE EVIDENCE: Use the scorecard to mock BOTH sides. Twist actual facts ("14 runs in 6 overs", "bowled out by a part-timer") into punchlines.
3. THE LORE INJECTION: Seamlessly inject 1 or 2 historical trolling points from the "OPTIONAL HISTORICAL LORE" for BOTH teams, if applicable. Tie their current performance to their franchise's historical DNA.
4. THE KILL SHOT: End with a signature closing jab—a one-liner summarizing the teams' eternal shame or delusion (e.g., "Come back when you can spell 'run' without crying").

=== CRITICAL RULES ===
- ROAST BOTH TEAMS: The winner is not safe. Find a reason to mock them.
- STRICT ERA-GATING: The "Match Year" is the absolute present. You have NO knowledge of events from years following the "Match Year".
- AVOID REAL-WORLD HARM: No personal attacks, abuse, or hate speech regarding players' families, religion, or injuries. The villain is the collapse itself.

=== FORMATTING ===
- STRICTLY ONE CONTINUOUS PARAGRAPH.
- NO line breaks, NO bullet points, NO markdown formatting, NO emojis. 
- Every single sentence must be a sharp, funny burn aimed at getting a laugh.
`.trim();
/**
 * Given fully-validated match data, generates a roast summary.
 */
export async function generateMatchRoast(
  matchData: Extract<AIResponseMatchPayload, { matchFound: true }>
): Promise<string> {
  const matchYear = new Date(matchData.matchDate).getFullYear();
  
  // Get historical context for both teams up to the match year
  const homeLore = getEraAppropriateLore(matchData.homeTeamShort, matchYear);
  const awayLore = getEraAppropriateLore(matchData.awayTeamShort, matchYear);

  console.log(
    `\n[GEMINI] Generating roast for ${matchData.homeTeam} vs ${matchData.awayTeam} (${matchYear})...`
  );

  // Build a rich context block so Gemini has specific facts to anchor the roast.
  const contextLines: string[] = [
    `Match: ${matchData.homeTeam} vs ${matchData.awayTeam}`,
    `Venue: ${matchData.venue}`,
    `Match Year: ${matchYear}`,
    `Result: ${matchData.matchStatus ?? (matchData.winner ? `${matchData.winner} won` : "Result unknown")}`,
    `Winner: ${matchData.winner ?? "Unknown"}`,
    `Loser: ${matchData.loser ?? "Unknown"}`,
    `Score summary: ${matchData.scoreSummary}`,
    `\n=== OPTIONAL HISTORICAL LORE (Use only if relevant to the vibe) ===`,
    `[${matchData.homeTeamShort} LORE]:\n${homeLore}`,
    `[${matchData.awayTeamShort} LORE]:\n${awayLore}`,
  ];

  if (matchData.scorecard?.innings) {
    contextLines.push("\n--- REAL-TIME SCORECARD STATS ---");
    matchData.scorecard.innings.forEach((inning) => {
      contextLines.push(`\n[${inning.team} INNINGS: ${inning.total}/${inning.wickets} in ${inning.overs} overs]`);
      contextLines.push("BATTING:");
      inning.batting.forEach((b) => {
        contextLines.push(`- ${b.player}: ${b.runs} off ${b.balls} (SR: ${b.strikeRate}) [${b.out}]`);
      });
      contextLines.push("BOWLING:");
      inning.bowling.forEach((b) => {
        contextLines.push(`- ${b.player}: ${b.overs} overs, ${b.runs} runs, ${b.wickets} wkts (Econ: ${b.economy})`);
      });
    });
  }

  const context = contextLines.join("\n");

  const response = await ai.models.generateContent({
    model: ROAST_MODEL,
    contents: `${ROAST_PROMPT}\n\n=== VERIFIED MATCH DATA ===\n${context}`,
    config: {
      temperature: 0.95,
    },
  });

  const text = response.text;
  if (!text || text.trim() === "") {
    throw new Error("[GEMINI] Roast model returned an empty response.");
  }

  return text.trim();
}
