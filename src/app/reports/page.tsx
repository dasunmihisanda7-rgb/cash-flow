"use client";

import { useTransactions } from "@/context/TransactionContext";
import { useCategories } from "@/context/CategoryContext";
import { Trash2, Paperclip, Search, ChevronDown, Check, Pencil } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EditTransactionModal from "@/components/ui/EditTransactionModal";
import { Transaction } from "@/app/page";

export default function LedgerPage() {
  const { transactions, deleteTransaction, updateTransaction } = useTransactions();
  const { incomeCategories, expenseCategories } = useCategories();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Sort transactions by date ascending for correct balance calculation (Memoized)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [transactions]);

  // 2. Calculate running balances (Memoized)
  const ledgerData = useMemo(() => {
    let currentBalance = 0;
    return sortedTransactions.map((t, index) => {
      if (t.type === 'income') {
        currentBalance += t.amount;
      } else {
        currentBalance -= t.amount;
      }
      return {
        ...t,
        refNo: `TXN-${(index + 1).toString().padStart(3, '0')}`,
        runningBalance: currentBalance
      };
    });
  }, [sortedTransactions]);

  // 3. Filter based on category and search query (Memoized)
  const filteredData = useMemo(() => {
    return ledgerData.filter(t => {
      const matchesCategory = filterCategory === "ALL" || t.category === filterCategory;
      const matchesSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.refNo.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [ledgerData, filterCategory, searchQuery]);

  // 4. All available unique categories for the filter dropdown (Memoized)
  const allCategories = useMemo(() => {
    return Array.from(new Set([...incomeCategories, ...expenseCategories])).sort();
  }, [incomeCategories, expenseCategories]);

  // 5. Reverse for display (Newest at top) (Memoized)
  const displayData = useMemo(() => [...filteredData].reverse(), [filteredData]);

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(val));
    return `Rs. ${formatted}`;
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Transaction Log..."
              className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-full pl-12 pr-4 py-3 text-xs font-black italic tracking-widest text-white placeholder-slate-500 focus:border-white/40 focus:ring-1 focus:ring-white/10 outline-none transition-all shadow-lg"
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="relative group inline-flex items-center bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-full shadow-lg hover:bg-white/[0.12] transition-all cursor-pointer overflow-hidden z-20"
            >
              <div className="px-5 pr-10 py-3 text-xs font-black italic tracking-widest text-white whitespace-nowrap">
                {filterCategory === "ALL" ? "ALL" : filterCategory.toUpperCase()}
              </div>
              <ChevronDown 
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''} text-slate-500`} 
                size={14} 
              />
            </button>

            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-[rgb(10,14,23)]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                >
                  <div className="max-h-[220px] overflow-y-auto custom-scrollbar py-2">
                    <button
                      onClick={() => { setFilterCategory("ALL"); setIsCategoryOpen(false); }}
                      className={`w-full text-left px-5 py-2.5 text-[10px] font-black italic tracking-widest uppercase transition-all hover:bg-[#9810FA]/10 flex items-center justify-between ${filterCategory === 'ALL' ? 'text-[#9810FA]' : 'text-slate-400'}`}
                    >
                      <span>ALL</span>
                      {filterCategory === 'ALL' && <Check size={12} className="text-[#9810FA]" />}
                    </button>
                    {allCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setFilterCategory(cat); setIsCategoryOpen(false); }}
                        className={`w-full text-left px-5 py-2.5 text-[10px] font-black italic tracking-widest uppercase transition-all hover:bg-[#9810FA]/10 flex items-center justify-between ${filterCategory === cat ? 'text-[#9810FA]' : 'text-slate-400'}`}
                      >
                        <span>{cat}</span>
                        {filterCategory === cat && <Check size={12} className="text-[#9810FA]" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-[10px] font-black italic tracking-widest text-slate-500 shrink-0 uppercase">
          SHOWING <span className="text-[#9810FA]">{displayData.length}</span> LEDGER ENTRIES
        </p>
      </div>

      <div className="bg-[rgb(7,10,18)] border border-slate-800 rounded-[35px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase">DATE</th>
                <th className="px-6 py-5 text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase">REF NO</th>
                <th className="px-6 py-5 text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase">PARTICULARS (CATEGORY / DETAILS)</th>
                <th className="px-6 py-5 text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase border-l border-slate-800/50 text-right">DEBIT (DR)</th>
                <th className="px-6 py-5 text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase border-l border-slate-800/50 text-right">CREDIT (CR)</th>
                <th className="px-6 py-5 text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase border-l border-slate-800/50 text-right">BALANCE</th>
                <th className="px-6 py-5 text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase text-center border-l border-slate-800/50">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {displayData.slice(0, visibleCount).map((row) => (
                <tr key={row.id} className="odd:bg-white/[0.02] hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-5 text-sm font-bold text-slate-400 font-mono tracking-tighter">
                    {row.date.split('-').reverse().join('/')}
                  </td>
                  <td className="px-6 py-5 text-xs font-black italic text-slate-500 tracking-wider">
                    {row.refNo}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black italic text-[#9810FA] uppercase tracking-tight">{row.category}</span>
                      {row.description && (
                        <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 mt-0.5">
                          {row.description}
                          {row.invoiceFile && <Paperclip size={10} className="text-purple-500" />}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-black italic text-rose-500 text-sm border-l border-slate-800/50">
                    {row.type === 'expense' ? formatCurrency(row.amount) : "—"}
                  </td>
                  <td className="px-6 py-5 text-right font-black italic text-emerald-500 text-sm border-l border-slate-800/50">
                    {row.type === 'income' ? formatCurrency(row.amount) : "—"}
                  </td>
                  <td className={`px-6 py-5 text-right font-black italic text-sm border-l border-slate-800/50 ${row.runningBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                    {formatCurrency(row.runningBalance)}
                  </td>
                  <td className="px-6 py-5 text-center border-l border-slate-800/50">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingTransaction(row as any)}
                        className="p-2 text-slate-600 hover:text-purple-400 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteTransaction(row.id)}
                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-500 text-xs font-black italic tracking-widest uppercase">
                    NO TRANSACTION RECORDS FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {displayData.length > visibleCount && (
            <div className="p-8 flex justify-center border-t border-slate-800/50">
              <button
                onClick={() => setVisibleCount(prev => prev + 20)}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black italic tracking-widest text-slate-400 hover:text-white transition-all uppercase"
              >
                Load More Records
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {editingTransaction && (
          <EditTransactionModal 
            transaction={editingTransaction}
            onClose={() => setEditingTransaction(null)}
            onUpdate={updateTransaction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
