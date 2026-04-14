import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import NavigationBar from "@/components/ui/NavigationBar";
import { CategoryProvider } from "@/context/CategoryContext";
import { TransactionProvider } from "@/context/TransactionContext";
import PageTransition from "@/components/ui/PageTransition";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Cash Flow Tracker",
  description: "Modern Income and Expense Tracking",
};

import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geist.className} bg-black text-slate-50 antialiased min-h-screen flex flex-col relative overflow-x-hidden`} suppressHydrationWarning>
        <AuthProvider>
          <AuthGuard>
            {/* Ambient background glows */}
            <div className="fixed -top-[10%] -left-[10%] w-[700px] h-[600px] bg-[#9810FA]/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed -bottom-[10%] -right-[10%] w-[700px] h-[500px] bg-[#3B82F6]/25 rounded-full blur-[130px] pointer-events-none z-0"></div>

            <CategoryProvider>
              <TransactionProvider>
                <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full relative z-10 flex flex-col gap-8">
                  <div className="space-y-1 text-center w-full flex flex-col items-center justify-center">
                    <h1 className="text-6xl font-black italic tracking-[-3px] uppercase text-white">CASH<span className="text-[#9810FA]">FLOW</span></h1>
                    <p 
                      className="text-[10px] leading-[15px] tracking-[8px] italic font-black uppercase"
                      style={{ color: "lab(35.5623 -1.74978 -15.4316)", fontStyle: "italic" }}
                    >
                      INCOME & EXPENSE TRACKER - BY DASUN MIHISANDA
                    </p>
                  </div>

                  <NavigationBar />

                  <PageTransition>
                    {children}
                  </PageTransition>
                </main>
              </TransactionProvider>
            </CategoryProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
