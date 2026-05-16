import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { type Metadata } from "next";
import { getMatchesBySeason } from "@/lib/actions/matches";
import { TeamFilter } from "@/components/matches/TeamFilter";
import { InfiniteMatchGrid } from "@/components/matches/InfiniteMatchGrid";
import { TEAM_DETAILS } from "@/lib/constants/teams";

// ISR: Roasts are added via script every ~5-6 hours.
// 1-hour revalidation ensures users see updated match cards within the hour.
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ team?: string | string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `IPL ${year} - All Match Roasts | BailsOnFire`,
    description: `Explore all match roasts and highlights from the IPL ${year} season.`,
  };
}

export default async function SeasonalMatchesPage({ params, searchParams }: PageProps) {
  const { year } = await params;
  const sParams = await searchParams;
  
  const yearNum = parseInt(year);
  if (isNaN(yearNum)) notFound();

  // Normalize selected teams to an array
  const rawTeams = sParams.team;
  const selectedTeams = Array.isArray(rawTeams) ? rawTeams : rawTeams ? [rawTeams] : [];
  
  // Map shortnames to full names for Prisma
  const fullTeamNames = selectedTeams.map(s => TEAM_DETAILS[s]?.fullName).filter(Boolean);

  // Initial fetch (10 at a time per user requested pagination)
  const initialPage = await getMatchesBySeason({
    year: yearNum,
    teams: fullTeamNames,
    limit: 10
  });

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
      {/* ── BREADCRUMB ────────────────────────────────────────────── */}
      <nav className="px-6 md:px-10 pt-10 relative z-10" aria-label="Breadcrumb">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[0.72rem] font-mono font-bold uppercase tracking-widest text-[#6B5E4A] hover:text-[#9B2C2C] transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6H3M5 2L1 6l4 4" />
          </svg>
          Back to Home
        </Link>
      </nav>

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="px-6 md:px-10 pt-6 pb-6 border-b-2 border-[#2C2B28] relative z-10">
        <div className="absolute bottom-1 left-0 w-full h-px bg-[#2C2B28]" />
        <p className="mb-2 text-[0.68rem] font-mono font-bold tracking-[0.22em] uppercase text-[#6B5E4A]">
          IPL Season {yearNum}
        </p>
        <h1 className="text-4xl md:text-5xl font-black font-serif uppercase tracking-tighter text-[#2C2B28]">
          Explore All Roasts
        </h1>
      </header>

      {/* ── FILTERS ───────────────────────────────────────────────── */}
      <Suspense fallback={<div className="h-20 bg-[#F9F6EF]" />}>
        <TeamFilter />
      </Suspense>

      {/* ── MATCH FEED ────────────────────────────────────────────── */}
      <div className="p-6 md:p-10 pb-20 relative z-10">
        <InfiniteMatchGrid 
          initialPage={initialPage} 
          year={yearNum} 
          selectedTeams={selectedTeams}
        />
      </div>
      
      {/* Background architectural vertical lines (mirroring other pages) */}
      <div className="fixed right-[5%] top-0 bottom-0 w-0.5 bg-[#2C2B28] pointer-events-none -z-10" aria-hidden="true" />
    </div>
  );
}
