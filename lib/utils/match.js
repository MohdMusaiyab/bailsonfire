"use strict";
/**
 * lib/utils/match.ts
 *
 * Shared utilities for match data processing and identification.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamShortName = getTeamShortName;
exports.buildUniformExternalId = buildUniformExternalId;
exports.buildScorecard = buildScorecard;
var KNOWN_TEAM_SHORTS = {
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
function getTeamShortName(teamName) {
    if (KNOWN_TEAM_SHORTS[teamName]) {
        return KNOWN_TEAM_SHORTS[teamName];
    }
    // Fallback: take the first letter of each word
    var words = teamName.split(" ").filter(Boolean);
    if (words.length >= 2) {
        return words.map(function (w) { return w[0].toUpperCase(); }).join("");
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
function buildUniformExternalId(dateStr, team1, team2) {
    // Normalize date down to YYYY-MM-DD
    var isoDate = "";
    if (dateStr instanceof Date) {
        isoDate = dateStr.toISOString().split("T")[0];
    }
    else {
        isoDate = new Date(dateStr).toISOString().split("T")[0];
    }
    var short1 = getTeamShortName(team1);
    var short2 = getTeamShortName(team2);
    // Alphabetical sort ensures CSK v RCB and RCB v CSK yield the exact same ID
    var _a = [short1, short2].sort(), first = _a[0], second = _a[1];
    return "".concat(isoDate, "_").concat(first, "_v_").concat(second);
}
function buildScorecard(doc) {
    var innings = doc.innings.map(function (inning) {
        var _a, _b;
        var totalRuns = 0;
        var totalWickets = 0;
        var legalDeliveries = 0;
        var battingStats = {};
        var bowlingStats = {};
        for (var _i = 0, _c = inning.overs; _i < _c.length; _i++) {
            var over = _c[_i];
            var overRuns = 0;
            var bowlerName = "";
            var _loop_1 = function (d) {
                bowlerName = d.bowler;
                // Team totals
                totalRuns += d.runs.total;
                if (d.wickets) {
                    totalWickets += d.wickets.length;
                }
                var isWide = !!((_a = d.extras) === null || _a === void 0 ? void 0 : _a.wides);
                var isNoBall = !!((_b = d.extras) === null || _b === void 0 ? void 0 : _b.noballs);
                var isLegal = !isWide && !isNoBall;
                if (isLegal)
                    legalDeliveries++;
                // Batting stats
                if (!battingStats[d.batter]) {
                    battingStats[d.batter] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: "not out" };
                }
                battingStats[d.batter].runs += d.runs.batter;
                if (d.runs.batter === 4)
                    battingStats[d.batter].fours++;
                if (d.runs.batter === 6)
                    battingStats[d.batter].sixes++;
                if (!isWide) {
                    battingStats[d.batter].balls++;
                }
                if (d.wickets && d.wickets.some(function (w) { return w.player_out === d.batter; })) {
                    battingStats[d.batter].out = "out";
                }
                // Bowling stats
                if (!bowlingStats[d.bowler]) {
                    bowlingStats[d.bowler] = { balls: 0, runs: 0, wickets: 0, maidens: 0 };
                }
                var deliveryRunsForBowler = d.runs.batter;
                if (isWide)
                    deliveryRunsForBowler += d.extras.wides;
                if (isNoBall)
                    deliveryRunsForBowler += d.extras.noballs;
                overRuns += deliveryRunsForBowler;
                bowlingStats[d.bowler].runs += deliveryRunsForBowler;
                if (isLegal)
                    bowlingStats[d.bowler].balls++;
                if (d.wickets) {
                    var bowlerWickets = d.wickets.filter(function (w) { return w.kind !== "run out" && w.kind !== "retired hurt"; }).length;
                    bowlingStats[d.bowler].wickets += bowlerWickets;
                }
            };
            for (var _d = 0, _e = over.deliveries; _d < _e.length; _d++) {
                var d = _e[_d];
                _loop_1(d);
            }
            // Check for maiden (if no runs were conceded in this over)
            if (overRuns === 0 && bowlerName && bowlingStats[bowlerName]) {
                bowlingStats[bowlerName].maidens++;
            }
        }
        var oversStr = "".concat(Math.floor(legalDeliveries / 6), ".").concat(legalDeliveries % 6);
        var batting = Object.entries(battingStats).map(function (_a) {
            var player = _a[0], stats = _a[1];
            return ({
                player: player,
                runs: stats.runs,
                balls: stats.balls,
                fours: stats.fours,
                sixes: stats.sixes,
                strikeRate: stats.balls > 0 ? parseFloat(((stats.runs / stats.balls) * 100).toFixed(2)) : 0,
                out: stats.out,
            });
        });
        var bowling = Object.entries(bowlingStats).map(function (_a) {
            var player = _a[0], stats = _a[1];
            var overs = parseFloat("".concat(Math.floor(stats.balls / 6), ".").concat(stats.balls % 6));
            return {
                player: player,
                overs: overs,
                runs: stats.runs,
                wickets: stats.wickets,
                maidens: stats.maidens,
                economy: stats.balls > 0 ? parseFloat(((stats.runs / (stats.balls / 6)).toFixed(2))) : 0,
            };
        });
        return {
            team: inning.team,
            total: totalRuns,
            wickets: totalWickets,
            overs: parseFloat(oversStr),
            batting: batting,
            bowling: bowling,
        };
    });
    return { innings: innings };
}
