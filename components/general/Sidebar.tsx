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
    <aside className="flex-shrink-0 bg-[#FCFBF7] w-full border-b border-[#1A1A1A]/5 lg:w-64 lg:border-r lg:border-b-0 lg:overflow-y-auto lg:sticky lg:top-0 lg:h-screen z-30">
      <div className="p-4 lg:p-8 flex flex-col sm:flex-row lg:flex-col gap-3 sm:items-center lg:items-start">
        <h3 className="text-[0.68rem] font-black tracking-[0.22em] uppercase text-[#1A1A1A]/30 lg:mb-8 whitespace-nowrap">
          IPL Seasons
        </h3>
        
        <nav className="flex flex-row lg:flex-col gap-2 lg:gap-3 overflow-x-auto w-full pb-1 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {availableSeasons.map((year) => {
            const isActive = pathname.includes(`/matches/${year}`);
            
            return (
              <Link
                key={year}
                href={`/matches/${year}`}
                className={`group relative py-2 px-4 lg:py-3 lg:px-4 rounded-xl text-sm font-bold tracking-tight transition-all flex-shrink-0 ${
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
                <div className="flex items-center justify-between gap-3">
                  <span>Season {year}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Decorative vertical line (architectural) - Desktop only */}
      <div className="absolute right-[10%] top-0 bottom-0 w-px bg-[#1A1A1A]/4 hidden lg:block" aria-hidden="true" />
    </aside>
  );
}
