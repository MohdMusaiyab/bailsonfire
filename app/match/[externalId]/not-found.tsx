/**
 * app/match/[externalId]/not-found.tsx
 * Renders when notFound() is called from the page — i.e. bad externalId.
 */

import Link from 'next/link';

export default function MatchNotFound() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-[0.68rem] font-black tracking-[0.22em] uppercase text-[#1A1A1A]/25 mb-4">
          404
        </p>
        <h1 className="text-3xl font-black tracking-tighter text-[#1A1A1A] mb-3">
          Match not found
        </h1>
        <p className="text-sm font-semibold text-[#1A1A1A]/40 mb-8">
          This match either doesn&apos;t exist or hasn&apos;t been roasted yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[0.75rem] font-black uppercase tracking-wider text-[#FCFBF7] bg-[#1A1A1A] rounded-lg hover:opacity-80 transition-opacity"
        >
          Back to Matches
        </Link>
      </div>
    </div>
  );
}
