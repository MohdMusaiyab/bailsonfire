"use strict";
/**
 * scripts/ingest-live.ts
 *
 * Lightweight live ingestion pipeline — NO AI roast generation.
 * Fetches ALL completed IPL matches from CricAPI that aren't in the DB
 * and upserts them with full scorecard data.
 *
 * Designed to be run by the GitHub Actions cron at 2 AM IST (20:30 UTC) daily.
 * Safe to run multiple times — idempotent upsert logic.
 *
 * Run manually: npx tsx scripts/ingest-live.ts
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
require("dotenv/config");
var cricapi_js_1 = require("../lib/ai/cricapi.js");
var prisma_js_1 = require("../lib/prisma.js");
function runLiveIngestion() {
    return __awaiter(this, void 0, void 0, function () {
        var newMatches, successCount, _i, newMatches_1, data, externalId, saved, err_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log("==================================================");
                    console.log("🏏 IPL LIVE BATCH INGESTION — MATCH + SCORECARD");
                    console.log("==================================================");
                    if (!process.env.CRICEKT_DATA_API) {
                        console.error("❌ CRICEKT_DATA_API is not set in environment.");
                        process.exit(1);
                    }
                    // ── Stage 1: Fetch ALL new completed IPL matches ──────────────────────────
                    console.log("\n[1/2] Checking CricAPI for new completed IPL matches...");
                    return [4 /*yield*/, (0, cricapi_js_1.fetchNewIPLMatches)()];
                case 1:
                    newMatches = _e.sent();
                    if (newMatches.length === 0) {
                        console.log("\n✅ No new matches found — everything is up to date. Exiting.");
                        return [2 /*return*/];
                    }
                    console.log("\n[2/2] Processing ".concat(newMatches.length, " new match(es)..."));
                    successCount = 0;
                    _i = 0, newMatches_1 = newMatches;
                    _e.label = 2;
                case 2:
                    if (!(_i < newMatches_1.length)) return [3 /*break*/, 7];
                    data = newMatches_1[_i];
                    externalId = data.externalId;
                    console.log("\n\uD83D\uDCC4 Ingesting: ".concat(data.homeTeam, " vs ").concat(data.awayTeam));
                    console.log("   ID: ".concat(externalId));
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, prisma_js_1.prisma.match.upsert({
                            where: { externalId: externalId },
                            create: {
                                externalId: externalId,
                                homeTeam: data.homeTeam,
                                awayTeam: data.awayTeam,
                                scoreSummary: data.scoreSummary,
                                venue: data.venue,
                                winner: (_a = data.winner) !== null && _a !== void 0 ? _a : null,
                                loser: (_b = data.loser) !== null && _b !== void 0 ? _b : null,
                                matchDate: new Date(data.matchDate),
                                scorecard: data.scorecard,
                                playerOfTheMatch: (_c = data.playerOfMatch) !== null && _c !== void 0 ? _c : null,
                                keyMoments: [],
                            },
                            update: {
                                scoreSummary: data.scoreSummary,
                                scorecard: data.scorecard,
                                venue: data.venue,
                                playerOfTheMatch: (_d = data.playerOfMatch) !== null && _d !== void 0 ? _d : null,
                            },
                        })];
                case 4:
                    saved = _e.sent();
                    console.log("   \u2705 SUCCESS: Match ".concat(saved.id, " upserted."));
                    successCount++;
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _e.sent();
                    console.error("   \u274C FAILED to ingest ".concat(externalId, ":"), err_1);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    console.log("\n==================================================");
                    console.log("✅ BATCH INGESTION COMPLETE");
                    console.log("   Total New Matches Found: ".concat(newMatches.length));
                    console.log("   Successfully Ingested  : ".concat(successCount));
                    console.log("==================================================");
                    return [2 /*return*/];
            }
        });
    });
}
runLiveIngestion()
    .catch(function (e) {
    console.error("\n❌ Fatal error during live ingestion:");
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_js_1.prisma.$disconnect()];
            case 1:
                _a.sent();
                console.log("\n[DB] Connection closed.");
                return [2 /*return*/];
        }
    });
}); });
