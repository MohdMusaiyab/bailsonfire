import Link from "next/link";
import { auth } from "@/auth";
import { UserNav } from "./UserNav";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FBFBF9]/90 backdrop-blur-md border-b-2 border-slate-900 overflow-hidden">
      {/* ── GRAIN OVERLAY ─────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]" />
      
      <div className="container relative z-10 mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        {/* LOGO / BRANDING */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="px-2 py-1 bg-slate-900 text-white font-serif text-xl leading-none shadow-[3px_3px_0px_0px_rgba(225,29,72,0.6)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black tracking-tighter text-xl text-slate-900 leading-none uppercase">
              Bails on Fire
            </span>
            <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mt-1 hidden sm:block">
              IPL Edition &middot; Vol. 2026
            </span>
          </div>
        </Link>

        {/* ACTIONS / NAVIGATION */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/matches/2026" 
              className="text-[0.65rem] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline decoration-rose-500 decoration-2 underline-offset-4 transition-colors"
            >
              Archives
            </Link>
            <Link 
              href="#wall-of-shame" 
              className="text-[0.65rem] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:underline decoration-rose-500 decoration-2 underline-offset-4 transition-colors"
            >
              Hall of Shame
            </Link>
          </nav>
          
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          
          <UserNav user={session?.user} />
        </div>
      </div>
    </header>
  );
}
