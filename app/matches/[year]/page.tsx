import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { type Metadata } from "next";
import { getMatchesBySeason } from "@/lib/actions/matches";
import { TeamFilter } from "@/components/matches/TeamFilter";
import { InfiniteMatchGrid } from "@/components/matches/InfiniteMatchGrid";
import { TEAM_DETAILS } from "@/lib/constants/teams";

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
    <div className="flex-1 flex flex-col">
      {/* ── BREADCRUMB ────────────────────────────────────────────── */}
      <nav className="px-8 pt-10" aria-label="Breadcrumb">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-widest text-[#1A1A1A]/35 hover:text-[#1A1A1A] transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6H3M5 2L1 6l4 4" />
          </svg>
          Back to Home
        </Link>
      </nav>

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="px-8 pt-6 pb-6 border-b border-[#1A1A1A]/5">
        <p className="mb-2 text-[0.68rem] font-black tracking-[0.22em] uppercase text-[#1A1A1A]/25">
          IPL Season {yearNum}
        </p>
        <h1 className="text-4xl font-black tracking-tighter text-[#1A1A1A]">
          Explore All Roasts
        </h1>
      </header>

      {/* ── FILTERS ───────────────────────────────────────────────── */}
      <Suspense fallback={<div className="h-20 bg-[#FCFBF7]" />}>
        <TeamFilter />
      </Suspense>

      {/* ── MATCH FEED ────────────────────────────────────────────── */}
      <div className="p-8 pb-20">
        <InfiniteMatchGrid 
          initialPage={initialPage} 
          year={yearNum} 
          selectedTeams={selectedTeams}
        />
      </div>
      
      {/* Background architectural vertical lines (mirroring other pages) */}
      <div className="fixed right-[5%] top-0 bottom-0 w-px bg-[#1A1A1A]/4 pointer-events-none -z-10" aria-hidden="true" />
    </div>
  );
}
