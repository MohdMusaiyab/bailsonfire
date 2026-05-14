/**
 * app/match/[externalId]/not-found.tsx
 * Renders when notFound() is called from the page — i.e. bad externalId.
 */

import Link from 'next/link';

export default function MatchNotFound() {
  return (
    <div className="min-h-screen bg-[#F9F6EF] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
      <div className="absolute left-[10%] top-0 bottom-0 w-0.5 bg-[#2C2B28]/10 hidden md:block" aria-hidden="true" />
      <div className="absolute right-[10%] top-0 bottom-0 w-0.5 bg-[#2C2B28]/10 hidden md:block" aria-hidden="true" />
      
      <div className="text-center max-w-sm relative z-10 border-4 border-[#2C2B28] bg-[#F9F6EF] p-10 shadow-[8px_8px_0_0_rgba(0,0,0,0.2)]">
        <p className="text-[0.8rem] font-mono font-bold tracking-[0.2em] uppercase text-[#6B5E4A] mb-4">
          Error 404
        </p>
        <h1 className="text-4xl font-black font-serif uppercase tracking-tighter text-[#2C2B28] mb-4">
          Record Missing
        </h1>
        <div className="h-0.5 w-16 bg-[#9B2C2C] mx-auto mb-6" />
        <p className="text-sm font-serif italic text-[#3A3126] mb-8 leading-relaxed">
          This match either doesn&apos;t exist or the publisher refused to print it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 text-[0.75rem] font-mono font-bold uppercase tracking-widest text-[#F9F6EF] bg-[#2C2B28] border-2 border-[#2C2B28] shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          Return to Front Page
        </Link>
      </div>
    </div>
  );
}
