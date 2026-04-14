"use client";

import { useState, useRef, useEffect } from "react";
import { Transaction } from "@/app/page";
import { TrendingDown, TrendingUp, ChevronDown, Filter, Calendar, Paperclip, X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useCategories } from "@/context/CategoryContext";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onAdd: (t: Omit<Transaction, "id">) => void;
};

export default function TransactionForm({ onAdd }: Props) {
  const { incomeCategories, expenseCategories } = useCategories();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [description, setDescription] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<{ name: string; size: number } | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceFile({ name: file.name, size: file.size });
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInvoiceFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const daysGrid = [];
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

  // Padding for start of month
  for (let i = 0; i < firstDay; i++) {
    daysGrid.push(null);
  }
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(i);
  }

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setDate(`${year}-${month}-${dayStr}`);
    setIsDateOpen(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    // Ensure we handle local date correctly to avoid offset issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options).toUpperCase();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (!rawValue) {
      setAmount("");
      return;
    }
    const formattedValue = new Intl.NumberFormat("en-US").format(parseInt(rawValue));
    setAmount(formattedValue);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        type,
        amount: parseFloat(amount.replace(/,/g, "")),
        category,
        date,
        description,
        invoiceFile: invoiceFile || undefined
      });

      setAmount("");
      setCategory("");
      setDescription("");
      setInvoiceFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[rgb(7,10,18)] border border-slate-800 rounded-[35px] p-6 shadow-2xl relative h-full">
      <form onSubmit={handleSubmit} className="flex gap-8 relative z-10">
        {/* Left Column: Type Selection */}
        <div className="flex flex-col gap-4 w-84 shrink-0">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`rounded-[35px] flex flex-col items-center justify-center gap-2 h-[160px] transition-all border text-[11px] leading-[16.5px] tracking-[1.1px] font-black italic ${type === "expense"
              ? "bg-rose-500/20 text-white border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
              : "bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600"
              }`}
          >
            <TrendingDown size={24} className={`shrink-0 ${type === 'expense' ? 'animate-bounce' : ''}`} />
            EXPENSE
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`rounded-[35px] flex flex-col items-center justify-center gap-2 h-[160px] transition-all border text-[11px] leading-[16.5px] tracking-[1.1px] font-black italic ${type === "income"
              ? "bg-emerald-500/20 text-white border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              : "bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600"
              }`}
          >
            <TrendingUp size={24} className={`shrink-0 ${type === 'income' ? 'animate-bounce' : ''}`} />
            INCOME
          </button>
        </div>

        {/* Right Column: Inputs */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/10 rounded-3xl pl-[60px] pr-12 py-6 text-white outline-none transition-all font-black italic text-left hover:bg-white/[0.05] relative z-20 overflow-hidden"
              >
                {category || "SELECT CATEGORY"}
              </button>
              <Filter 
                className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none z-30 ${
                  type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                }`} 
                size={20} 
                strokeWidth={3}
              />
              <ChevronDown 
                className={`absolute right-6 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none z-30 ${isCategoryOpen ? 'rotate-180' : ''} text-slate-500`} 
                size={20} 
              />
              
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[rgb(10,14,23)]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                  >
                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar py-2">
                       {currentCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => { setCategory(cat); setIsCategoryOpen(false); }}
                          className={`w-full text-left px-8 py-4 text-xs font-black italic tracking-widest uppercase transition-all hover:bg-[#9810FA]/10 flex items-center justify-between ${category === cat ? 'text-[#9810FA]' : 'text-slate-400'}`}
                        >
                          <span>{cat}</span>
                          {category === cat && <Check size={16} className="text-[#9810FA]" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amount}
                onChange={handleAmountChange}
                className="w-full bg-[rgb(5,7,13)] border border-slate-800 focus:border-white/20 focus:ring-1 focus:ring-white/10 rounded-3xl px-[20px] py-6 text-white outline-none transition-all placeholder-slate-700 font-bold"
                placeholder="Amount (LKR)"
              />
            </div>
          </div>

          <div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value.toUpperCase())}
              className="w-full bg-[rgb(5,7,13)] border border-slate-800 focus:border-white/20 focus:ring-1 focus:ring-white/10 rounded-3xl px-[20px] py-6 text-white outline-none transition-all placeholder-slate-700 font-bold"
              placeholder="Details (Optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/10 rounded-3xl pl-[60px] pr-12 py-6 text-white outline-none transition-all font-black italic text-left hover:bg-white/[0.05] relative z-20 overflow-hidden"
              >
                {formatDisplayDate(date)}
              </button>
              <Calendar 
                className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none z-30 ${
                  type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                }`} 
                size={20} 
                strokeWidth={3}
              />
              <ChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-30 transition-transform duration-300 ${isDateOpen ? 'rotate-180' : ''}`} size={20} />
              
              <AnimatePresence>
                {isDateOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 md:left-auto md:w-[320px] mt-2 bg-[rgb(10,14,23)]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 p-6"
                  >
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xs font-black italic tracking-widest text-white uppercase">
                        {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                      </h4>
                      <div className="flex gap-2">
                        <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <ChevronLeft size={16} className="text-slate-400" />
                        </button>
                        <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <ChevronRight size={16} className="text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Day Labels */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-black text-slate-600">{d}</div>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {daysGrid.map((day, idx) => {
                        const isCurrentDate = day && 
                          new Date(date).getDate() === day && 
                          new Date(date).getMonth() === viewDate.getMonth() && 
                          new Date(date).getFullYear() === viewDate.getFullYear();
                        
                        return (
                          <div key={idx} className="aspect-square flex items-center justify-center">
                            {day ? (
                              <button
                                type="button"
                                onClick={() => handleDateSelect(day)}
                                className={`w-full h-full text-[10px] font-bold rounded-xl transition-all flex items-center justify-center
                                  ${isCurrentDate 
                                    ? 'bg-[#9810FA] text-white shadow-[0_0_15px_rgba(152,16,250,0.4)]' 
                                    : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                              >
                                {day}
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        setDate(today.toISOString().split('T')[0]);
                        setViewDate(today);
                        setIsDateOpen(false);
                      }}
                      className="w-full mt-6 py-2 text-[10px] font-black italic tracking-widest text-[#9810FA] hover:text-purple-400 transition-colors uppercase"
                    >
                      GO TO TODAY
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative group">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/10 rounded-3xl pl-[60px] pr-12 py-6 text-white outline-none transition-all font-black italic text-left truncate hover:bg-white/[0.05] relative z-20 overflow-hidden"
              >
                {invoiceFile ? invoiceFile.name.toUpperCase() : "ATTACH INVOICE"}
              </button>
              <Paperclip 
                className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none z-30 ${
                  type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                }`} 
                size={20} 
                strokeWidth={3}
              />
              {invoiceFile && (
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-rose-500 transition-colors z-20"
                >
                  <X size={18} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-5 px-4 rounded-xl text-white font-black text-xs tracking-[0.15em] transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${type === 'income'
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
              : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-500/20'
              }`}
          >
            {isSubmitting ? "SYNCING TO CLOUD..." : "SYNC TRANSACTION TO CLOUD"}
          </button>
        </div>
      </form>
    </div>
  );
}
