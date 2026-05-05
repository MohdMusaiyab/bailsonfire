"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIResponseMatchSchema = exports.MatchScorecardSchema = exports.InningScorecardSchema = exports.ScorecardBowlingSchema = exports.ScorecardBattingSchema = exports.ReactionSchema = exports.ReactionTypeEnum = exports.CommentSchema = exports.SummarySchema = exports.MatchSchema = void 0;
var zod_1 = require("zod");
exports.MatchSchema = zod_1.z.object({
    id: zod_1.z.string().cuid().optional(),
    externalId: zod_1.z.string(),
    homeTeam: zod_1.z.string().min(1, "Home team is required"),
    awayTeam: zod_1.z.string().min(1, "Away team is required"),
    scoreSummary: zod_1.z.string().min(1, "Score summary is required"),
    matchDate: zod_1.z.coerce.date(),
    venue: zod_1.z.string().min(1, "Venue is required"),
    winner: zod_1.z.string().nullish(),
    loser: zod_1.z.string().nullish(),
    playerOfTheMatch: zod_1.z.string().nullish(),
    keyMoments: zod_1.z.array(zod_1.z.string()).default([]),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
});
exports.SummarySchema = zod_1.z.object({
    id: zod_1.z.string().cuid().optional(),
    matchId: zod_1.z.string().cuid(),
    content: zod_1.z.string().min(1, "Content cannot be empty"),
    aiModel: zod_1.z.string().min(1, "AI Model identifier is required"),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
});
exports.CommentSchema = zod_1.z.object({
    id: zod_1.z.string().cuid().optional(),
    content: zod_1.z
        .string()
        .min(1, "Comment cannot be empty")
        .max(500, "Comment is too long"),
    userId: zod_1.z.string().cuid(),
    matchId: zod_1.z.string().cuid(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
});
exports.ReactionTypeEnum = zod_1.z.enum(["FIRE", "LOVE", "AVERAGE", "TRASH"]);
exports.ReactionSchema = zod_1.z.object({
    id: zod_1.z.string().cuid().optional(),
    userId: zod_1.z.string().cuid(),
    matchId: zod_1.z.string().cuid(),
    type: exports.ReactionTypeEnum,
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
});
exports.ScorecardBattingSchema = zod_1.z.object({
    player: zod_1.z.string(),
    runs: zod_1.z.number(),
    balls: zod_1.z.number(),
    strikeRate: zod_1.z.number(),
    fours: zod_1.z.number(),
    sixes: zod_1.z.number(),
    out: zod_1.z.string(),
});
exports.ScorecardBowlingSchema = zod_1.z.object({
    player: zod_1.z.string(),
    overs: zod_1.z.number(),
    runs: zod_1.z.number(),
    wickets: zod_1.z.number(),
    maidens: zod_1.z.number(),
    economy: zod_1.z.number(),
});
exports.InningScorecardSchema = zod_1.z.object({
    team: zod_1.z.string(),
    total: zod_1.z.number(),
    wickets: zod_1.z.number(),
    overs: zod_1.z.number(),
    batting: zod_1.z.array(exports.ScorecardBattingSchema),
    bowling: zod_1.z.array(exports.ScorecardBowlingSchema),
});
exports.MatchScorecardSchema = zod_1.z.object({
    innings: zod_1.z.array(exports.InningScorecardSchema),
});
exports.AIResponseMatchSchema = zod_1.z.discriminatedUnion("matchFound", [
    zod_1.z.object({
        matchFound: zod_1.z.literal(false),
    }),
    zod_1.z.object({
        matchFound: zod_1.z.literal(true),
        externalId: zod_1.z.string(),
        homeTeam: zod_1.z.string(),
        awayTeam: zod_1.z.string(),
        homeTeamShort: zod_1.z.string(),
        awayTeamShort: zod_1.z.string(),
        scoreSummary: zod_1.z.string(),
        matchStatus: zod_1.z.string().optional(),
        venue: zod_1.z.string(),
        winner: zod_1.z.string().nullish(),
        loser: zod_1.z.string().nullish(),
        matchDate: zod_1.z.string(),
        scorecard: exports.MatchScorecardSchema.optional(),
        playerOfMatch: zod_1.z.string().nullish(), // Man of the match from CricAPI
        homeTeamStats: zod_1.z.object({
            wins: zod_1.z.number(),
            played: zod_1.z.number(),
            streak: zod_1.z.string(),
        }).optional(),
        awayTeamStats: zod_1.z.object({
            wins: zod_1.z.number(),
            played: zod_1.z.number(),
            streak: zod_1.z.string(),
        }).optional(),
    })
]);
