"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import DashboardCards from "@/components/ui/DashboardCards";
import TransactionForm from "@/components/ui/TransactionForm";
import { useTransactions } from "@/context/TransactionContext";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  description: string;
  invoiceFile?: { name: string; size: number };
};

// Dynamically import heavy charts to prevent navigation blockage
const BreakdownCharts = dynamic(() => import("@/components/ui/BreakdownCharts"), { ssr: false });
const CashFlowTrend = dynamic(() => import("@/components/ui/CashFlowTrend"), { ssr: false });

export default function Home() {
  const { transactions, addTransaction } = useTransactions();
  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Stagger chart entry to allow transition to complete smoothly
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Use memoization for high-performance math during transitions
  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // Render a stable container with subtle mounting animation
  return (
    <div className={`flex flex-col gap-8 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <DashboardCards 
        balance={totals.balance} 
        income={totals.income} 
        expense={totals.expense} 
      />

      <div className="w-full">
        <TransactionForm onAdd={addTransaction} />
      </div>

      {isReady && (
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-8"
        >
          <BreakdownCharts />
          <CashFlowTrend />
        </motion.div>
      )}
    </div>
  );
}
