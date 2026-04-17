import React from "react";
import { SeasonalSidebar } from "@/components/general/Sidebar";
import { getAvailableSeasons } from "@/lib/actions/matches";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function SeasonalMatchesLayout({ children }: LayoutProps) {
  const seasons = await getAvailableSeasons();

  return (
    <div className="flex min-h-screen bg-[#FCFBF7]">
      {/* Sidebar for Season Switching */}
      <SeasonalSidebar availableSeasons={seasons} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
