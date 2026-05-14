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
    <aside className="flex-shrink-0 bg-[#F9F6EF] w-full border-b-2 border-[#2C2B28] lg:w-64 lg:border-r-2 lg:border-b-0 lg:overflow-y-auto lg:sticky lg:top-0 lg:h-screen z-30 relative">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
      <div className="p-4 lg:p-8 flex flex-col sm:flex-row lg:flex-col gap-3 sm:items-center lg:items-start relative z-10">
        <h3 className="text-[0.68rem] font-mono font-bold tracking-[0.22em] uppercase text-[#6B5E4A] lg:mb-8 whitespace-nowrap">
          IPL Seasons
        </h3>
        
        <nav className="flex flex-row lg:flex-col gap-2 lg:gap-3 overflow-x-auto w-full pb-1 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {availableSeasons.map((year) => {
            const isActive = pathname.includes(`/matches/${year}`);
            
            return (
              <Link
                key={year}
                href={`/matches/${year}`}
                className={`group relative py-2 px-4 lg:py-3 lg:px-4 border-2 text-[0.8rem] font-mono font-bold uppercase tracking-widest transition-all flex-shrink-0 ${
                  isActive 
                    ? "text-[#F9F6EF] bg-[#2C2B28] border-[#2C2B28] shadow-[3px_3px_0_0_rgba(0,0,0,0.3)]" 
                    : "text-[#2C2B28] bg-transparent border-transparent hover:border-[#2C2B28] hover:bg-[#F9F6EF]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-[#2C2B28] -z-10"
                  />
                )}
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <span>Season {year}</span>
                  {isActive && <span className="w-2 h-2 bg-[#F9F6EF] border border-[#F9F6EF]" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Decorative vertical line (architectural) - Desktop only */}
      <div className="absolute right-[10%] top-0 bottom-0 w-0.5 bg-[#2C2B28]/20 hidden lg:block" aria-hidden="true" />
    </aside>
  );
}
