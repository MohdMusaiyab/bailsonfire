import Link from "next/link";
import { auth } from "@/auth";
import { UserNav } from "./UserNav";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1A1A1A]/5 bg-[#FCFBF7]/80 backdrop-blur-md">
      <div className="container mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center text-[#FCFBF7] font-black text-xs group-hover:scale-105 transition-transform shadow-md">
            B
          </div>
          <span className="font-black tracking-tighter text-lg text-[#1A1A1A] hidden sm:block">
            BAILS ON FIRE
          </span>
        </Link>
        <UserNav user={session?.user} />
      </div>
    </header>
  );
}
