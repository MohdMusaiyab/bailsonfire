import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { UserNav } from "./UserNav";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F9F6EF]/90 backdrop-blur-md border-b-2 border-[#2C2B28]">
      {/* Paper texture overlay – subtle */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" />

      <div className="container relative z-10 mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        {/* LOGO / BRANDING */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden bg-[#2C2B28] border border-[#2C2B28] shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Bails on Fire Logo"
              width={40}
              height={40}
              className="object-cover scale-110"
              priority
            />
          </div>
          <span className="font-serif font-black tracking-tighter text-2xl text-[#2C2B28] leading-none uppercase mt-1">
            Bails on Fire
          </span>
        </Link>

        {/* ACTIONS / NAVIGATION */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/matches/2026"
              className="text-[0.7rem] font-mono font-bold uppercase tracking-widest text-[#3A3126] hover:text-[#5A3A2A] hover:underline decoration-[#9B2C2C] decoration-2 underline-offset-4 transition-colors"
            >
              Archives
            </Link>
            <Link
              href="/#wall-of-shame"
              className="text-[0.7rem] font-mono font-bold uppercase tracking-widest text-[#3A3126] hover:text-[#5A3A2A] hover:underline decoration-[#9B2C2C] decoration-2 underline-offset-4 transition-colors"
            >
              Hall of Shame
            </Link>
          </nav>

          <div className="h-6 w-px bg-[#2C2B28]/20 hidden md:block" />

          <UserNav user={session?.user} />
        </div>
      </div>
    </header>
  );
}
