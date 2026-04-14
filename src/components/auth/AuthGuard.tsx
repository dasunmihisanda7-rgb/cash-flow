"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#9810FA]/20 rounded-full blur-[80px]"></div>
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-black italic text-white animate-pulse tracking-[-1px]">
            LOADING SECURE <span className="text-[#9810FA]">SESSION</span>...
          </h1>
          <p className="text-[10px] font-black italic tracking-[5px] text-slate-500 mt-2 uppercase">VERIFYING CLOUD IDENTITY</p>
        </div>
      </div>
    );
  }

  // If not logged in and not on login page, show nothing while redirecting
  if (!user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
