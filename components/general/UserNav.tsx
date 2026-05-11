"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";

interface UserNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        href="/auth/sign-in"
        className="px-6 py-2.5 bg-slate-900 text-white text-[0.65rem] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(225,29,72,0.4)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        Sign In
      </Link>
    );
  }

  const initials = user.name
    ? user.name.substring(0, 2).toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-1 py-1 border-2 border-slate-900 bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all focus:outline-none"
      >
        <div className="w-8 h-8 bg-slate-100 flex items-center justify-center text-slate-900 font-serif text-xs font-bold border-r border-slate-900">
          {user.image ? (
            <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <ChevronDown size={14} className={`text-slate-500 mr-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,0.1)] z-50 origin-top-right overflow-hidden"
          >
            {/* Header / Info */}
            <div className="p-4 bg-slate-50 border-b border-slate-900/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[0.5rem] font-bold uppercase tracking-tighter">
                  Subscriber
                </span>
                <span className="text-[0.55rem] font-black uppercase tracking-widest text-slate-400">
                  ID: #{user.email?.split('@')[0].substring(0, 4)}
                </span>
              </div>
              <p className="text-sm font-serif font-bold text-slate-900 truncate uppercase">
                {user.name || "Anonymous Mob"}
              </p>
              <p className="text-[0.6rem] font-black tracking-widest uppercase text-slate-400 truncate mt-1">
                {user.email}
              </p>
            </div>

            {/* Menu Actions */}
            <div className="p-1">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-3 text-[0.65rem] font-black tracking-widest uppercase text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cancel Subscription
              </button>
            </div>
            
            {/* Sarcastic footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-900/5">
              <p className="text-[0.5rem] font-serif italic text-slate-400 text-center">
                &quot;Read responsibly. Roasts are sharp.&quot;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
