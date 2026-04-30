import { z } from "zod";
export const MatchSchema = z.object({
  id: z.string().cuid().optional(),
  externalId: z.string(),
  homeTeam: z.string().min(1, "Home team is required"),
  awayTeam: z.string().min(1, "Away team is required"),
  scoreSummary: z.string().min(1, "Score summary is required"),
  matchDate: z.coerce.date(),
  venue: z.string().min(1, "Venue is required"),
  winner: z.string().nullish(),
  loser: z.string().nullish(),
  playerOfTheMatch: z.string().nullish(),
  keyMoments: z.array(z.string()).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export const SummarySchema = z.object({
  id: z.string().cuid().optional(),
  matchId: z.string().cuid(),
  content: z.string().min(1, "Content cannot be empty"),
  aiModel: z.string().min(1, "AI Model identifier is required"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export const CommentSchema = z.object({
  id: z.string().cuid().optional(),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment is too long"),
  userId: z.string().cuid(),
  matchId: z.string().cuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export const ReactionTypeEnum = z.enum(["FIRE", "LOVE", "AVERAGE", "TRASH"]);

export const ReactionSchema = z.object({
  id: z.string().cuid().optional(),
  userId: z.string().cuid(),
  matchId: z.string().cuid(),
  type: ReactionTypeEnum,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export const ScorecardBattingSchema = z.object({
  player: z.string(),
  runs: z.number(),
  balls: z.number(),
  strikeRate: z.number(),
  out: z.string(),
});

export const ScorecardBowlingSchema = z.object({
  player: z.string(),
  overs: z.number(),
  runs: z.number(),
  wickets: z.number(),
  economy: z.number(),
});

export const InningScorecardSchema = z.object({
  team: z.string(),
  total: z.number(),
  wickets: z.number(),
  overs: z.number(),
  batting: z.array(ScorecardBattingSchema),
  bowling: z.array(ScorecardBowlingSchema),
});

export const MatchScorecardSchema = z.object({
  innings: z.array(InningScorecardSchema),
});

export type ScorecardBatting = z.infer<typeof ScorecardBattingSchema>;
export type ScorecardBowling = z.infer<typeof ScorecardBowlingSchema>;
export type InningScorecard = z.infer<typeof InningScorecardSchema>;
export type MatchScorecard = z.infer<typeof MatchScorecardSchema>;

export const AIResponseMatchSchema = z.discriminatedUnion("matchFound", [
  z.object({
    matchFound: z.literal(false),
  }),
  z.object({
    matchFound: z.literal(true),
    externalId: z.string().optional(), // CricAPI UUID — used as DB externalId when present
    homeTeam: z.string(),
    awayTeam: z.string(),
    homeTeamShort: z.string(),
    awayTeamShort: z.string(),
    scoreSummary: z.string(),
    matchStatus: z.string().optional(), // e.g. "Delhi Capitals won by 5 wickets"
    venue: z.string(),
    winner: z.string().nullish(),
    loser: z.string().nullish(),
    matchDate: z.string(),
    scorecard: MatchScorecardSchema.optional(), // The full scorecard JSON
  })
]);
export type MatchPayload = z.infer<typeof MatchSchema>;
export type SummaryPayload = z.infer<typeof SummarySchema>;
export type CommentPayload = z.infer<typeof CommentSchema>;
export type ReactionPayload = z.infer<typeof ReactionSchema>;
export type ReactionType = z.infer<typeof ReactionTypeEnum>;
export type AIResponseMatchPayload = z.infer<typeof AIResponseMatchSchema>;

// ---------------------------------------------------------------------------
// UI-facing derived types — used by server actions and components.
// These represent exactly what the DB query returns; nothing more.
// ---------------------------------------------------------------------------

/** One summary preview attached to a match card (first summary only). */
export type SummaryPreview = {
  id: string;
  content: string; // full roast — truncated in the UI if needed
};

/**
 * Shape returned by `getRecentMatches` server action.
 * Represents a single match card on the home page.
 */
export type RecentMatchCard = {
  id: string;
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  scoreSummary: string;
  matchDate: Date;
  venue: string;
  winner: string | null;
  loser: string | null;
  reactionsCount: number; // Total count of all reactions
  commentsCount: number;
  summary: SummaryPreview | null; // null if roast not yet generated
};

/** Full match detail — used by the roast page. */
export type MatchDetail = {
  id: string;
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  scoreSummary: string;
  matchDate: Date;
  venue: string;
  winner: string | null;
  loser: string | null;
  reactionsCount: number;
  commentsCount: number;
  userReaction: ReactionType | null; // The reaction the current user has given
  reactionBreakdown: Record<ReactionType, number>; // Breakdown of each type
  summary: {
    id: string;
    content: string;
    aiModel: string;
  } | null;
};

/** A single comment row, including the author's display name. */
export type CommentItem = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

/** Paginated comments page returned by getComments. */
export type CommentsPage = {
  items: CommentItem[];
  /** Pass as cursor on the next call. Null if no more pages. */
  nextCursor: string | null;
};

/** Paginated matches page returned by getMatchesBySeason. */
export type MatchesPage = {
  items: RecentMatchCard[];
  /** Pass as cursor on the next call. Null if no more pages. */
  nextCursor: string | null;
};
