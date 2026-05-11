import React from "react";

export function Footer() {
  return (
    <footer className="w-full py-12 px-6 bg-[#FBFBF9] border-t-4 border-slate-900 mt-auto">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          {/* Brand & Copyright */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4 tracking-tighter uppercase">
              Bails on Fire
            </h2>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
              &copy; {new Date().getFullYear()} &middot; Independent Editorial Project
            </p>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-slate-400">
              Made with insomnia & lack of consistency
            </p>
          </div>

          {/* Legal Disclaimer */}
          <div className="md:text-right">
            <p className="text-sm font-serif text-slate-800 leading-relaxed max-w-lg md:ml-auto">
              <strong className="text-slate-900 uppercase text-xs tracking-widest block mb-2">Legal Disclaimer</strong> 
              This is an independent fan project and is not affiliated, endorsed, or sponsored by the Board of Control for Cricket in India (BCCI) or the Indian Premier League (IPL). All trademarks belong to their respective owners.
            </p>
          </div>
        </div>

        {/* Bottom Rule */}
        <div className="mt-12 w-full h-px bg-slate-900/10" />
        <div className="mt-1 w-full h-px bg-slate-900/5" />
      </div>
    </footer>
  );
}
