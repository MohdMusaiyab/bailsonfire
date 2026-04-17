"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const TEAM_SHORTNAMES: Record<string, string> = {
  "Mumbai Indians": "mi",
  "Chennai Super Kings": "csk",
  "Royal Challengers Bengaluru": "rcb",
  "Kolkata Knight Riders": "kkr",
  "Delhi Capitals": "dc",
  "Sunrisers Hyderabad": "srh",
  "Rajasthan Royals": "rr",
  "Punjab Kings": "pbks",
  "Lucknow Super Giants": "lsg",
  "Gujarat Titans": "gt",
};

const TEAM_COLORS: Record<string, string> = {
  "mi": "#004BA0",
  "csk": "#C8A800",
  "rcb": "#CC1020",
  "kkr": "#552791",
  "dc": "#0078BC",
  "srh": "#D4881E",
  "rr": "#EA1A85",
  "pbks": "#C41020",
  "lsg": "#3B82F6",
  "gt": "#1C1C1C",
};

export function TeamFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
        
        {Object.entries(TEAM_SHORTNAMES).map(([fullName, shortName]) => {
          const isSelected = selectedTeams.includes(shortName);
          const color = TEAM_COLORS[shortName];
          
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
