"use client";

import React, { useState, useEffect, useTransition } from "react";
import { MatchCard } from "@/components/match/MatchCard";
import { getMatchesBySeason } from "@/lib/actions/matches";
import { type MatchesPage, type RecentMatchCard } from "@/lib/validations/models";

interface Props {
  initialPage: MatchesPage;
  year: number;
  selectedTeams: string[];
}

// Helper to map shortnames back to full team names for the DB query
const TEAM_MAP: Record<string, string> = {
  "mi": "Mumbai Indians",
  "csk": "Chennai Super Kings",
  "rcb": "Royal Challengers Bengaluru",
  "kkr": "Kolkata Knight Riders",
  "dc": "Delhi Capitals",
  "srh": "Sunrisers Hyderabad",
  "rr": "Rajasthan Royals",
  "pbks": "Punjab Kings",
  "lsg": "Lucknow Super Giants",
  "gt": "Gujarat Titans",
};

export function InfiniteMatchGrid({ initialPage, year, selectedTeams }: Props) {
  const [matches, setMatches] = useState<RecentMatchCard[]>(initialPage.items);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
  const [isPending, startTransition] = useTransition();

  // Reset local state when filters or year changes (passed down from server)
  useEffect(() => {
    setMatches(initialPage.items);
    setNextCursor(initialPage.nextCursor);
  }, [initialPage]);

  function loadMore() {
    if (!nextCursor || isPending) return;

    startTransition(async () => {
      // Convert shortnames back to full names
      const fullTeamNames = selectedTeams.map(s => TEAM_MAP[s]).filter(Boolean);
      
      const result = await getMatchesBySeason({
        year,
        teams: fullTeamNames,
        cursor: nextCursor,
        limit: 10
      });

      setMatches((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
    });
  }

  return (
    <div className="flex flex-col gap-12 w-full">
      {matches.length === 0 ? (
        <div className="py-32 text-center border-y-2 border-dashed border-[#2C2B28]">
          <p className="text-sm font-mono font-bold text-[#6B5E4A] uppercase tracking-widest">
            No clippings found for this selection.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8">
          {matches.map((match, i) => (
            <div key={match.id} className="w-full md:w-[calc(50%-1rem)] xl:w-[calc(33.333%-1.334rem)] flex">
              <MatchCard match={match} index={i} />
            </div>
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center pb-20">
          <button
            onClick={loadMore}
            disabled={isPending}
            className={`px-8 py-3 text-[0.7rem] font-mono font-bold uppercase tracking-[0.2em] border-2 border-[#2C2B28] transition-all ${
              isPending 
                ? "bg-[#2C2B28] text-[#F9F6EF] opacity-50 cursor-not-allowed translate-x-[3px] translate-y-[3px]" 
                : "bg-[#F9F6EF] text-[#2C2B28] shadow-[5px_5px_0_0_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-[#2C2B28] hover:text-[#F9F6EF]"
            }`}
          >
            {isPending ? "Printing..." : "Load More Roasts"}
          </button>
        </div>
      )}
    </div>
  );
}
