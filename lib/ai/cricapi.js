"use strict";
/**
 * lib/ai/cricapi.ts
 *
 * CricAPI client — handles batch fetching of completed IPL matches.
 *
 * FEATURES:
 * - Deduplication: Skips matches already in DB.
 * - Scorecard Recovery: If a match is in the DB but lacks a scorecard,
 *   it will be re-processed to attempt to fill the missing data.
 * - Chronological Order: Matches are processed oldest-first for data consistency.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNewIPLMatches = fetchNewIPLMatches;
exports.fetchRecentIPLMatch = fetchRecentIPLMatch;
var prisma_js_1 = require("../prisma.js");
var match_js_1 = require("../utils/match.js");
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
var BASE_URL = "https://api.cricapi.com/v1";
var API_KEY = process.env.CRICEKT_DATA_API;
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getApiKey() {
    if (!API_KEY)
        throw new Error("[CRICAPI] Missing CRICEKT_DATA_API.");
    return API_KEY;
}
function toMidnightUTC(dateStr) {
    return "".concat(dateStr, "T00:00:00.000Z");
}
function buildScoreSummary(score, teams, teamInfo) {
    if (!score || score.length === 0)
        return "".concat(teams.join(" vs "));
    return score.map(function (entry, index) {
        var _a;
        var lowerInning = entry.inning.toLowerCase();
        var mentionedTeams = teamInfo.filter(function (t) { return lowerInning.includes(t.name.toLowerCase()); });
        var label = "";
        if (mentionedTeams.length === 1) {
            label = mentionedTeams[0].shortname;
        }
        else if (mentionedTeams.length > 1) {
            if (index > 0) {
                var prevInningTeam_1 = teamInfo.find(function (t) { return score[index - 1].inning.toLowerCase().includes(t.name.toLowerCase()); });
                var currentTeam = mentionedTeams.find(function (t) { return t.name !== (prevInningTeam_1 === null || prevInningTeam_1 === void 0 ? void 0 : prevInningTeam_1.name); });
                label = (_a = currentTeam === null || currentTeam === void 0 ? void 0 : currentTeam.shortname) !== null && _a !== void 0 ? _a : mentionedTeams[0].shortname;
            }
            else {
                label = mentionedTeams[0].shortname;
            }
        }
        else {
            label = entry.inning.split(" Inning")[0];
        }
        return "".concat(label, " ").concat(entry.r, "/").concat(entry.w, " (").concat(entry.o, " ov)");
    }).join(" | ");
}
function deriveWinnerLoser(status, teams, explicitWinner) {
    var _a, _b, _c;
    if (explicitWinner) {
        var winner = (_a = teams.find(function (t) { return t.toLowerCase() === explicitWinner.toLowerCase(); })) !== null && _a !== void 0 ? _a : explicitWinner;
        var loser = (_b = teams.find(function (t) { return t.toLowerCase() !== explicitWinner.toLowerCase(); })) !== null && _b !== void 0 ? _b : null;
        return { winner: winner, loser: loser };
    }
    if (!status || teams.length < 2)
        return { winner: null, loser: null };
    var lowerStatus = status.toLowerCase();
    var _loop_1 = function (team) {
        if (lowerStatus.includes(team.toLowerCase()) && lowerStatus.includes("won")) {
            var loser = (_c = teams.find(function (t) { return t !== team; })) !== null && _c !== void 0 ? _c : null;
            return { value: { winner: team, loser: loser } };
        }
    };
    for (var _i = 0, teams_1 = teams; _i < teams_1.length; _i++) {
        var team = teams_1[_i];
        var state_1 = _loop_1(team);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return { winner: null, loser: null };
}
// ---------------------------------------------------------------------------
// Single Match Fetcher (Private)
// ---------------------------------------------------------------------------
function fetchFullMatchData(match) {
    return __awaiter(this, void 0, void 0, function () {
        var matchId, infoUrl, infoRes, infoBody, info, scUrl, scRes, rawScorecards, scBody, scoreData_1, mappedInnings, infoTeams, teamInfo, homeTeam, awayTeam, uniformExternalId, _a, winner, loser, rawPom, playerOfMatch, err_1;
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return __generator(this, function (_s) {
            switch (_s.label) {
                case 0:
                    matchId = match.id;
                    _s.label = 1;
                case 1:
                    _s.trys.push([1, 7, , 8]);
                    infoUrl = "".concat(BASE_URL, "/match_info?apikey=").concat(getApiKey(), "&id=").concat(matchId);
                    return [4 /*yield*/, fetch(infoUrl)];
                case 2:
                    infoRes = _s.sent();
                    if (!infoRes.ok)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, infoRes.json()];
                case 3:
                    infoBody = (_s.sent());
                    info = infoBody.data;
                    scUrl = "".concat(BASE_URL, "/match_scorecard?apikey=").concat(getApiKey(), "&id=").concat(matchId);
                    return [4 /*yield*/, fetch(scUrl)];
                case 4:
                    scRes = _s.sent();
                    rawScorecards = [];
                    if (!scRes.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, scRes.json()];
                case 5:
                    scBody = _s.sent();
                    if (scBody.status === "success" && scBody.data) {
                        rawScorecards = (_b = scBody.data.scorecard) !== null && _b !== void 0 ? _b : [];
                    }
                    _s.label = 6;
                case 6:
                    scoreData_1 = ((_c = info.score) === null || _c === void 0 ? void 0 : _c.length) ? info.score : (((_d = match.score) === null || _d === void 0 ? void 0 : _d.length) ? match.score : []);
                    mappedInnings = rawScorecards.map(function (inning) {
                        var _a, _b, _c, _d, _e, _f;
                        var teamName = ((_a = inning.inning) === null || _a === void 0 ? void 0 : _a.split(" Inning")[0]) || "Unknown";
                        var inningScore = scoreData_1.find(function (s) { return s.inning === inning.inning; });
                        return {
                            team: teamName,
                            total: (_b = inningScore === null || inningScore === void 0 ? void 0 : inningScore.r) !== null && _b !== void 0 ? _b : 0,
                            wickets: (_c = inningScore === null || inningScore === void 0 ? void 0 : inningScore.w) !== null && _c !== void 0 ? _c : 0,
                            overs: (_d = inningScore === null || inningScore === void 0 ? void 0 : inningScore.o) !== null && _d !== void 0 ? _d : 0,
                            batting: ((_e = inning.batting) !== null && _e !== void 0 ? _e : []).map(function (b) {
                                var _a, _b, _c, _d, _e, _f, _g, _h;
                                return ({
                                    player: (_b = (_a = b.batsman) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Unknown",
                                    runs: (_c = b.r) !== null && _c !== void 0 ? _c : 0,
                                    balls: (_d = b.b) !== null && _d !== void 0 ? _d : 0,
                                    strikeRate: (_e = b.sr) !== null && _e !== void 0 ? _e : 0,
                                    fours: (_f = b["4s"]) !== null && _f !== void 0 ? _f : 0,
                                    sixes: (_g = b["6s"]) !== null && _g !== void 0 ? _g : 0,
                                    out: ((_h = b["dismissal-text"]) !== null && _h !== void 0 ? _h : "").toLowerCase() === "not out" || !b.dismissal ? "not out" : "out",
                                });
                            }),
                            bowling: ((_f = inning.bowling) !== null && _f !== void 0 ? _f : []).map(function (b) {
                                var _a, _b, _c, _d, _e, _f, _g;
                                return ({
                                    player: (_b = (_a = b.bowler) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Unknown",
                                    overs: (_c = b.o) !== null && _c !== void 0 ? _c : 0,
                                    runs: (_d = b.r) !== null && _d !== void 0 ? _d : 0,
                                    wickets: (_e = b.w) !== null && _e !== void 0 ? _e : 0,
                                    maidens: (_f = b.m) !== null && _f !== void 0 ? _f : 0,
                                    economy: (_g = b.eco) !== null && _g !== void 0 ? _g : 0,
                                });
                            }),
                        };
                    });
                    infoTeams = (_e = info.teams) !== null && _e !== void 0 ? _e : [];
                    teamInfo = (_f = info.teamInfo) !== null && _f !== void 0 ? _f : [];
                    homeTeam = (_g = infoTeams[0]) !== null && _g !== void 0 ? _g : "";
                    awayTeam = (_h = infoTeams[1]) !== null && _h !== void 0 ? _h : "";
                    uniformExternalId = (0, match_js_1.buildUniformExternalId)(toMidnightUTC(info.date), homeTeam, awayTeam);
                    _a = deriveWinnerLoser(info.status, infoTeams, info.matchWinner), winner = _a.winner, loser = _a.loser;
                    rawPom = (_k = (_j = info.playerOfMatch) !== null && _j !== void 0 ? _j : info.playerOfTheMatch) !== null && _k !== void 0 ? _k : null;
                    playerOfMatch = Array.isArray(rawPom) ? ((_m = (_l = rawPom[0]) === null || _l === void 0 ? void 0 : _l.name) !== null && _m !== void 0 ? _m : null) : (typeof rawPom === "string" ? rawPom : null);
                    return [2 /*return*/, {
                            matchFound: true,
                            externalId: uniformExternalId,
                            homeTeam: homeTeam,
                            awayTeam: awayTeam,
                            homeTeamShort: (_p = (_o = teamInfo[0]) === null || _o === void 0 ? void 0 : _o.shortname) !== null && _p !== void 0 ? _p : homeTeam.slice(0, 3).toUpperCase(),
                            awayTeamShort: (_r = (_q = teamInfo[1]) === null || _q === void 0 ? void 0 : _q.shortname) !== null && _r !== void 0 ? _r : awayTeam.slice(0, 3).toUpperCase(),
                            scoreSummary: buildScoreSummary(scoreData_1, infoTeams, teamInfo),
                            matchStatus: info.status,
                            venue: info.venue,
                            winner: winner,
                            loser: loser,
                            matchDate: toMidnightUTC(info.date),
                            scorecard: mappedInnings.length > 0 ? { innings: mappedInnings } : undefined,
                            playerOfMatch: playerOfMatch,
                        }];
                case 7:
                    err_1 = _s.sent();
                    console.error("[CRICAPI] Error fetching data for match ".concat(matchId, ":"), err_1);
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// Batch Fetcher (Exported)
// ---------------------------------------------------------------------------
function fetchNewIPLMatches() {
    return __awaiter(this, void 0, void 0, function () {
        var url, res, body, completedIPL, results, _i, completedIPL_1, m, teams, uniformId, existing, needsIngestion, sc, hasInnings, fullData;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    url = "".concat(BASE_URL, "/currentMatches?apikey=").concat(getApiKey(), "&offset=0");
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    res = _d.sent();
                    if (!res.ok)
                        throw new Error("[CRICAPI] HTTP ".concat(res.status));
                    return [4 /*yield*/, res.json()];
                case 2:
                    body = (_d.sent());
                    completedIPL = body.data.filter(function (m) {
                        return m.name.toLowerCase().includes("indian premier league") && m.matchEnded === true;
                    });
                    if (completedIPL.length === 0)
                        return [2 /*return*/, []];
                    // Sort by dateTimeGMT ascending (oldest first) to ensure correct DB insertion order
                    completedIPL.sort(function (a, b) { return new Date(a.dateTimeGMT).getTime() - new Date(b.dateTimeGMT).getTime(); });
                    results = [];
                    _i = 0, completedIPL_1 = completedIPL;
                    _d.label = 3;
                case 3:
                    if (!(_i < completedIPL_1.length)) return [3 /*break*/, 7];
                    m = completedIPL_1[_i];
                    teams = (_a = m.teams) !== null && _a !== void 0 ? _a : [];
                    uniformId = (0, match_js_1.buildUniformExternalId)(toMidnightUTC(m.date), (_b = teams[0]) !== null && _b !== void 0 ? _b : "", (_c = teams[1]) !== null && _c !== void 0 ? _c : "");
                    return [4 /*yield*/, prisma_js_1.prisma.match.findUnique({
                            where: { externalId: uniformId },
                            select: { id: true, scorecard: true },
                        })];
                case 4:
                    existing = _d.sent();
                    needsIngestion = false;
                    if (!existing) {
                        console.log("[CRICAPI] \uD83C\uDD95 NEW match detected: ".concat(m.name));
                        needsIngestion = true;
                    }
                    else {
                        sc = existing.scorecard;
                        hasInnings = sc && Array.isArray(sc.innings) && sc.innings.length > 0;
                        if (!hasInnings) {
                            console.log("[CRICAPI] \uD83E\uDE79 RECOVERY: Match ".concat(m.name, " exists but is missing a scorecard. Re-fetching..."));
                            needsIngestion = true;
                        }
                    }
                    if (!needsIngestion) return [3 /*break*/, 6];
                    return [4 /*yield*/, fetchFullMatchData(m)];
                case 5:
                    fullData = _d.sent();
                    if (fullData)
                        results.push(fullData);
                    _d.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7: return [2 /*return*/, results];
            }
        });
    });
}
function fetchRecentIPLMatch() {
    return __awaiter(this, void 0, void 0, function () {
        var news;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchNewIPLMatches()];
                case 1:
                    news = _a.sent();
                    if (news.length === 0)
                        return [2 /*return*/, { matchFound: false }];
                    return [2 /*return*/, news[0]];
            }
        });
    });
}
