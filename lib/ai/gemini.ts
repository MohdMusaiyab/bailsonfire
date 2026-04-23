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

// ---------------------------------------------------------------------------
// Stage 2: Generate roast (exported — uses lighter model, no search needed)
// ---------------------------------------------------------------------------

const ROAST_PROMPT = `
You are somone with years of experince in making Jokes and have knowlegde about cricket and memes, you write in meme tone, things that can go viral and are funny

TASK:
Using ONLY the match data below, write a 150–200 word roast of the ENTIRE match — both teams, both innings, every embarrassing dot ball and overpriced wicket. Make it so exaggerated and ridiculous that a person reading it will laugh the shit out of his mind, he will read it and will be like WTF did I just ready, is it for real.

RULES (each rule is now also a joke):

1. ROAST BOTH SIDES LIKE A DOUBLE-DUTY FUNERAL:
   The winning team does not get a parade. They get a participation trophy shaped like a toilet brush. If they won by 1 run, that's not heroism — that's the universe shitting itself and forgetting to clean up. Find the stupidity on both benches.

2. USE REAL NAMES AND REAL NUMBERS — THEN LIE ABOUT HOW BAD THEY ARE:
   A batsman scored 12 off 18 balls? Say he "occupied the crease like a depressed parking attendant." A bowler went for 52 runs in 3 overs? Say he "bowled with the accuracy of a drunk uncle playing darts." The truth is funny, but your version of the truth is funnier.

3. MONEY = SHAME. DO THE MATH LIKE A SCAM CALLER:
   Calculate rupees per run, crores per wicket. Then scream it. "₹4.2 crore for THAT innings? You could have paid 10,000 plumbers to show up on time and they'd all do less damage." Do this for both teams. Make the numbers sound like a ransom note.

4. HYPERBOLE IS NOT A TOOL, IT IS YOUR RELIGION:
   A misfield is not a misfield. It is "a tribute to humanity's eternal struggle against hand-eye coordination." A wide ball down leg side is "the ball's desperate cry for freedom from a captain who clearly hates geometry." No small mistakes. Only small tragedies.

5. THE VENUE MUST SUFFER TOO:
   Name the stadium and city exactly once. Then describe it as "a place where sixes go to die and fielders go to remember what grass feels like." Make the ground file an emotional damage claim.

6. CLOSING LINE — ONE SENTENCE, NO SURVIVORS:
   End with a line so stupidly sharp that both teams want to pretend they never read it. Example: "Tonight, eleven grown men in blue tried to chase 140 and made it look like assembling IKEA furniture in the dark."

7. TONE = EXHAUSTED COMEDIAN WHO HAS SEEN TOO MUCH:
   You are not angry. You are disappointed — like a father whose son just tried to hit a six off a yorker with the wrong bat. Sarcastic, articulate, and deeply, deeply tired. No cruelty to people, only to their choices.

8. OUTPUT RULES:
   Plain text. No emojis, no hashtags, no markdown. Short sentences. Lots of weird metaphors. Write like you are narrating a nature documentary about a species that evolved thumbs specifically to drop catches.

NOW GO. BURY THIS MATCH.
`.trim();
/**
 * Given fully-validated match data, generates a roast summary.
 * Uses the lighter model since no web grounding is required here.
 */
export async function generateMatchRoast(
  matchData: Extract<AIResponseMatchPayload, { matchFound: true }>
): Promise<string> {
  console.log(
    `\n[GEMINI] Generating roast for ${matchData.homeTeam} vs ${matchData.awayTeam}...`
  );

  // Build a rich context block so Gemini has specific facts to anchor the roast.
  // matchStatus (e.g. "Delhi Capitals won by 5 wickets") is the single most
  // important fact — it gets its own labelled line at the top.
  const contextLines: string[] = [
    `Match: ${matchData.homeTeam} vs ${matchData.awayTeam}`,
    `Venue: ${matchData.venue}`,
    `Date: ${matchData.matchDate.split("T")[0]}`,
    `Result: ${matchData.matchStatus ?? (matchData.winner ? `${matchData.winner} won` : "Result unknown")}`,
    `Winner: ${matchData.winner ?? "Unknown"}`,
    `Loser: ${matchData.loser ?? "Unknown"}`,
    `Score summary: ${matchData.scoreSummary}`,
  ];

  if (matchData.scorecard?.innings) {
    contextLines.push("\n--- FULL SCORECARD ---");
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
    contents: `${ROAST_PROMPT}\n\n=== VERIFIED MATCH DATA (use ONLY this) ===\n${context}`,
    config: {
      temperature: 1.2,
    },
  });

  const text = response.text;
  if (!text || text.trim() === "") {
    throw new Error("[GEMINI] Roast model returned an empty response.");
  }

  return text.trim();
}
