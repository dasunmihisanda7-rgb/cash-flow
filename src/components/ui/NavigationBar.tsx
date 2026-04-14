"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, Wallet, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

function NavigationBar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: "SUMMARY", href: "/", icon: ChartColumn },
    { label: "LOG", href: "/reports", icon: Wallet },
    { label: "CONTROL", href: "/settings", icon: Settings },
  ];

  if (!user) return null;

  return (
    <nav className="mx-auto w-max px-8 h-[58px] flex items-center justify-between gap-8 mb-8 mt-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-full">
      <div className="flex items-center justify-center gap-4 text-[10px] font-black italic tracking-[1px] text-[#62748E]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`group relative flex items-center gap-1.5 px-3 py-4 rounded-full transition-all duration-300 ${isActive ? 'text-white' : 'hover:text-white'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#9810FA] rounded-full shadow-lg shadow-purple-500/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-1.5 px-3">
                <Icon size={14} className="transition-transform duration-300 group-hover:scale-115" />
                <span className="hidden md:inline">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">CLOUD ACTIVE</span>
          <span className="text-[9px] font-black italic text-[#9810FA] truncate max-w-[100px] uppercase">{user.email?.split('@')[0]}</span>
        </div>
        <button
          onClick={signOut}
          className="p-2 rounded-full text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300"
          title="Sign Out"
        >
          <LogOut size={16} strokeWidth={3} />
        </button>
      </div>
    </nav>
  );
}

export default React.memo(NavigationBar);
