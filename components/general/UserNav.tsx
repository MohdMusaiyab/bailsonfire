"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User as UserIcon } from "lucide-react";

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
        className="px-5 py-2.5 text-[0.65rem] font-black tracking-[0.15em] uppercase bg-[#1A1A1A] text-[#FCFBF7] rounded-full hover:scale-[1.03] active:scale-95 transition-all shadow-md"
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
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-[#1A1A1A]/10 text-[#1A1A1A] font-black text-xs hover:border-[#1A1A1A]/30 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
      >
        {user.image ? (
          <img src={user.image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-black/5 border border-[#1A1A1A]/5 overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-[#1A1A1A]/5 bg-[#FCFBF7]">
              <p className="text-sm font-black text-[#1A1A1A] truncate">{user.name || "User"}</p>
              <p className="text-[0.65rem] font-bold tracking-widest uppercase text-[#1A1A1A]/40 truncate mt-1">{user.email}</p>
            </div>
            <div className="p-2">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-3 text-xs font-black tracking-widest uppercase text-[#1A1A1A]/60 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
