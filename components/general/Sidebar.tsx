"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface SidebarProps {
  availableSeasons: number[];
}

export function SeasonalSidebar({ availableSeasons }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#1A1A1A]/5 bg-[#FCFBF7] hidden lg:block overflow-y-auto sticky top-0 h-screen">
      <div className="p-8">
        <h3 className="text-[0.68rem] font-black tracking-[0.22em] uppercase text-[#1A1A1A]/30 mb-8">
          IPL Seasons
        </h3>
        
        <nav className="flex flex-col gap-3">
          {availableSeasons.map((year) => {
            const isActive = pathname.includes(`/matches/${year}`);
            
            return (
              <Link
                key={year}
                href={`/matches/${year}`}
                className={`group relative py-3 px-4 rounded-xl text-sm font-bold tracking-tight transition-all ${
                  isActive 
                    ? "text-[#1A1A1A] bg-white border border-[#1A1A1A]/5 shadow-sm" 
                    : "text-[#1A1A1A]/40 hover:text-[#1A1A1A] hover:bg-white/40"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-[#1A1A1A]/5 -z-10"
                  />
                )}
                <div className="flex items-center justify-between">
                  <span>Season {year}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Decorative vertical line (architectural) */}
      <div className="absolute right-[10%] top-0 bottom-0 w-px bg-[#1A1A1A]/4" aria-hidden="true" />
    </aside>
  );
}
