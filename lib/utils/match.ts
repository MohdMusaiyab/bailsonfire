/**
 * lib/utils/match.ts
 *
 * Shared utilities for match data processing and identification.
 */

const KNOWN_TEAM_SHORTS: Record<string, string> = {
  // Active Franchises
  "Chennai Super Kings": "CSK",
  "Delhi Capitals": "DC",
  "Gujarat Titans": "GT",
  "Kolkata Knight Riders": "KKR",
  "Lucknow Super Giants": "LSG",
  "Mumbai Indians": "MI",
  "Punjab Kings": "PBKS",
  "Rajasthan Royals": "RR",
  "Royal Challengers Bengaluru": "RCB",
  "Sunrisers Hyderabad": "SRH",

  // Legacy/Defunct/Alternate Spellings
  "Delhi Daredevils": "DC", // Folded into Delhi Capitals
  "Kings XI Punjab": "PBKS", // Folded into Punjab Kings
  "Royal Challengers Bangalore": "RCB",
  "Deccan Chargers": "DCG",
  "Pune Warriors": "PWI",
  "Kochi Tuskers Kerala": "KTK",
  "Gujarat Lions": "GL",
  "Rising Pune Supergiant": "RPS",
  "Rising Pune Supergiants": "RPS",
};

/**
 * Derives a 3-4 letter abbreviation for a team name.
 */
export function getTeamShortName(teamName: string): string {
  if (KNOWN_TEAM_SHORTS[teamName]) {
    return KNOWN_TEAM_SHORTS[teamName];
  }

  // Fallback: take the first letter of each word
  const words = teamName.split(" ").filter(Boolean);
  if (words.length >= 2) {
    return words.map((w) => w[0].toUpperCase()).join("");
  }

  // If it's a single word, just take the first 3 letters
  return teamName.substring(0, 3).toUpperCase();
}

/**
 * Builds a universal, clean, visually uniform external ID.
 * Format: YYYY-MM-DD_<TeamA>_v_<TeamB>
 * Order of teams is strictly alphabetical to prevent duplicates on the same day.
 * Example: "2026-04-18_CSK_v_RCB"
 */
export function buildUniformExternalId(dateStr: string | Date, team1: string, team2: string): string {
  // Normalize date down to YYYY-MM-DD
  let isoDate = "";
  if (dateStr instanceof Date) {
    isoDate = dateStr.toISOString().split("T")[0];
  } else {
    isoDate = new Date(dateStr).toISOString().split("T")[0];
  }

  const short1 = getTeamShortName(team1);
  const short2 = getTeamShortName(team2);

  // Alphabetical sort ensures CSK v RCB and RCB v CSK yield the exact same ID
  const [first, second] = [short1, short2].sort();

  return `${isoDate}_${first}_v_${second}`;
}
