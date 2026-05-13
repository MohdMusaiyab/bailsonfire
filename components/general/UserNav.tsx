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
        className="px-6 py-3 bg-[#2C2B28] text-[#F9F6EF] text-[0.65rem] font-mono font-bold uppercase tracking-[0.2em] shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#5A3A2A] transition-all"
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
        className="flex items-center gap-2 px-1 py-1 border-2 border-[#2C2B28] bg-[#F9F6EF] shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all focus:outline-none group"
      >
        <div className="w-8 h-8 bg-[#2C2B28] flex items-center justify-center text-[#F9F6EF] font-serif text-xs font-bold border-r-2 border-[#2C2B28]">
          {user.image ? (
            <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <ChevronDown size={14} className={`text-[#2C2B28] mr-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-[#F9F6EF] border-2 border-[#2C2B28] shadow-[6px_6px_0_0_rgba(0,0,0,0.2)] z-50 origin-top-right overflow-hidden"
          >
            {/* Header / Info */}
            <div className="p-4 border-b-2 border-[#2C2B28] relative">
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
              
              <div className="relative z-10">
                <p className="text-sm font-serif font-black text-[#2C2B28] truncate uppercase">
                  {user.name || "Anonymous Mob"}
                </p>
                <p className="text-[0.6rem] font-mono font-bold tracking-widest uppercase text-[#6B5E4A] truncate mt-1">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="p-1 bg-[#F9F6EF] relative">
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] mix-blend-multiply" aria-hidden="true" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="relative z-10 w-full flex items-center gap-3 px-3 py-3 text-[0.65rem] font-mono font-bold tracking-widest uppercase text-[#3A3126] hover:text-[#F9F6EF] hover:bg-[#9B2C2C] transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
