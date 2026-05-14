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
    <div className="py-4 lg:py-6 border-b-2 border-[#2C2B28] bg-[#F9F6EF] sticky top-0 z-20 px-6 md:px-10">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
      <div className="flex overflow-x-auto items-center gap-3 lg:flex-wrap pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
        <span className="flex-shrink-0 whitespace-nowrap text-[0.65rem] font-mono font-bold tracking-[0.2em] uppercase text-[#6B5E4A] mr-2">
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
              className={`relative flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 lg:gap-2.5 lg:px-3.5 lg:py-2 text-[0.65rem] font-mono font-bold uppercase tracking-widest transition-all border-2 border-[#2C2B28] ${
                isSelected 
                  ? "bg-[#2C2B28] text-[#F9F6EF] shadow-[inset_3px_3px_0_0_rgba(0,0,0,0.5)] translate-x-[2px] translate-y-[2px]" 
                  : "bg-[#F9F6EF] text-[#2C2B28] shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              }`}
            >
              <span 
                className="w-2 h-2 border border-[#2C2B28]" 
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
            className="flex-shrink-0 whitespace-nowrap text-[0.65rem] font-mono font-bold uppercase tracking-widest text-[#9B2C2C] hover:text-[#5A1A1A] transition-colors ml-2 lg:ml-4 underline underline-offset-4 decoration-[#9B2C2C]"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
