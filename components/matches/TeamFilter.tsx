"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SEASON_TEAMS, TEAM_DETAILS } from "@/lib/constants/teams";

export function TeamFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  
  const yearStr = params?.year as string;
  const yearNum = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
  
  // Fallback to latest teams if year is somehow invalid
  const availableTeamKeys = SEASON_TEAMS[yearNum] || SEASON_TEAMS[2026];

  
  // Get currently selected teams from search params
  const selectedTeams = searchParams.getAll("team");

  function toggleTeam(shortname: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("team");
    
    if (current.includes(shortname)) {
      // Remove team
      params.delete("team");
      current.filter(t => t !== shortname).forEach(t => params.append("team", t));
    } else {
      // Add team
      params.append("team", shortname);
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("team");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="py-6 border-b border-[#1A1A1A]/5 bg-[#FCFBF7]/80 backdrop-blur-md sticky top-0 z-20 px-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[0.6rem] font-black tracking-[0.2em] uppercase text-[#1A1A1A]/30 mr-2">
          Filter Teams:
        </span>
        
        {availableTeamKeys.map((shortName) => {
          const isSelected = selectedTeams.includes(shortName);
          const teamInfo = TEAM_DETAILS[shortName];
          if (!teamInfo) return null;
          
          const color = teamInfo.color;
          const fullName = teamInfo.fullName;
          
          return (
            <button
              key={shortName}
              onClick={() => toggleTeam(shortName)}
              className={`relative flex items-center gap-2.5 px-3.5 py-2 rounded-full text-[0.72rem] font-bold tracking-tight transition-all border ${
                isSelected 
                  ? "bg-[#1A1A1A] text-[#FCFBF7] border-[#1A1A1A]" 
                  : "bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30"
              }`}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: color }}
              />
              {fullName}
              
              {isSelected && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1 text-[0.6rem] opacity-50"
                >
                  ✕
                </motion.span>
              )}
            </button>
          );
        })}
        
        {selectedTeams.length > 0 && (
          <button
            onClick={clearAll}
            className="text-[0.65rem] font-bold uppercase tracking-widest text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors ml-4"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
