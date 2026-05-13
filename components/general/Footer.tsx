import React from "react";

export function Footer() {
  return (
    <footer className="relative w-full py-12 px-5 md:px-8 bg-[#F9F6EF] border-t-4 border-[#2C2B28] mt-auto overflow-hidden">
      {/* Paper texture overlay (consistent) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          {/* Brand & Copyright */}
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tighter text-[#2C2B28] mb-3 uppercase">
              Bails on Fire
            </h2>
            <p className="text-[0.65rem] font-mono font-bold uppercase tracking-[0.2em] text-[#6B5E4A] mb-1.5">
              © {new Date().getFullYear()} · Independent Editorial Project
            </p>
            <p className="text-[0.65rem] font-mono font-bold uppercase tracking-[0.2em] text-[#6B5E4A]/70">
              Made with insomnia & lack of consistency
            </p>
          </div>

          {/* Legal Disclaimer – vintage tone */}
          <div className="md:text-right">
            <div className="max-w-lg md:ml-auto">
              <span className="text-[0.55rem] font-mono font-bold uppercase tracking-[0.2em] text-[#9B2C2C] block mb-2">
                Legal Disclaimer
              </span>
              <p className="text-xs sm:text-sm font-serif text-[#3A3126] leading-relaxed">
                This is an independent fan project and is not affiliated,
                endorsed, or sponsored by the Board of Control for Cricket in
                India (BCCI) or the Indian Premier League (IPL). All trademarks
                belong to their respective owners.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom rules – vintage double line */}
        <div className="mt-12 w-full h-px bg-[#2C2B28]/20" />
        <div className="mt-1 w-full h-px bg-[#2C2B28]/10" />
      </div>
    </footer>
  );
}
