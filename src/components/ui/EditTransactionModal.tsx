"use client";

import { useState, useRef, useEffect } from "react";
import { X, TrendingDown, TrendingUp, ChevronDown, Check, Calendar, Paperclip, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "@/context/CategoryContext";
import { Transaction } from "@/app/page";

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
}

export default function EditTransactionModal({ transaction, onClose, onUpdate }: EditTransactionModalProps) {
  const { incomeCategories, expenseCategories } = useCategories();
  
  const [type, setType] = useState<"income" | "expense">(transaction.type);
  const [amount, setAmount] = useState(new Intl.NumberFormat("en-US").format(transaction.amount));
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(transaction.date);
  const [description, setDescription] = useState(transaction.description);
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(transaction.date));

  const categoryRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (!rawValue) {
      setAmount("");
      return;
    }
    const formattedValue = new Intl.NumberFormat("en-US").format(parseInt(rawValue));
    setAmount(formattedValue);
  };

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

  for (let i = 0; i < firstDay; i++) daysGrid.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysGrid.push(i);

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setDate(`${year}-${month}-${dayStr}`);
    setIsDateOpen(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options).toUpperCase();
  };

  const handleSave = () => {
    if (!amount || !category || !date) return;
    onUpdate(transaction.id, {
      type,
      amount: parseFloat(amount.replace(/,/g, "")),
      category,
      date,
      description
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[rgb(7,10,18)] border border-slate-800 rounded-[40px] shadow-3xl overflow-visible p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-wider">Edit Transaction</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Type Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => setType("income")}
              className={`flex-1 py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all font-black italic uppercase text-[10px] tracking-widest ${
                type === 'income' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <TrendingUp size={16} /> Income
            </button>
            <button
              onClick={() => setType("expense")}
              className={`flex-1 py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all font-black italic uppercase text-[10px] tracking-widest ${
                type === 'expense' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <TrendingDown size={16} /> Expense
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest ml-4">Amount (LKR)</label>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-black italic text-xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all placeholder:text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category Component */}
            <div className="space-y-2 relative" ref={categoryRef}>
              <label className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest ml-4">Category</label>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white font-black italic text-[11px] uppercase tracking-wider flex items-center justify-between group hover:border-slate-700 transition-all"
              >
                <span className={category ? "text-white" : "text-slate-700"}>
                  {category || "SELECT"}
                </span>
                <ChevronDown size={16} className={`text-slate-600 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 top-full left-0 right-0 mt-2 bg-[rgb(10,14,24)]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-3xl overflow-hidden"
                  >
                    <div className="max-h-48 overflow-y-auto premium-scrollbar">
                      {currentCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => { setCategory(cat); setIsCategoryOpen(false); }}
                          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-purple-500/10 transition-colors group"
                        >
                          <span className="text-[10px] font-black italic text-slate-400 group-hover:text-purple-400 uppercase tracking-widest">{cat}</span>
                          {category === cat && <Check size={14} className="text-purple-500" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date Picker Component */}
            <div className="space-y-2 relative" ref={datePickerRef}>
              <label className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest ml-4">Date</label>
              <button
                type="button"
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white font-black italic text-[11px] uppercase tracking-wider flex items-center justify-between group hover:border-slate-700 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Calendar size={14} className="text-purple-500" />
                  {formatDisplayDate(date)}
                </span>
                <ChevronDown size={16} className={`text-slate-600 transition-transform duration-300 ${isDateOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDateOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 top-full right-0 mt-2 w-72 bg-[rgb(10,14,24)]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-3xl p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={handlePrevMonth} className="p-1 hover:text-purple-500 transition-colors"><ChevronLeft size={18} /></button>
                      <span className="text-[10px] font-black italic tracking-[0.2em] uppercase text-white">
                        {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={handleNextMonth} className="p-1 hover:text-purple-500 transition-colors"><ChevronRight size={18} /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-black text-slate-600">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {daysGrid.map((day, i) => (
                        <div key={i} className="aspect-square">
                          {day && (
                            <button
                              onClick={() => handleDateSelect(day)}
                              className={`w-full h-full rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${
                                date === `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(152,16,250,0.4)]'
                                : 'text-slate-400 hover:bg-white/5'
                              }`}
                            >
                              {day}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        const today = new Date();
                        setViewDate(today);
                        handleDateSelect(today.getDate());
                      }}
                      className="w-full mt-4 py-2 border border-slate-800 rounded-xl text-[9px] font-black italic text-slate-500 hover:text-white hover:border-slate-600 transition-all uppercase tracking-widest"
                    >
                      Go to Today
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Details Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest ml-4">Particulars</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.toUpperCase())}
              placeholder="ADDITIONAL DETAILS..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-black italic text-xs h-24 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all placeholder:text-slate-800 resize-none uppercase"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-white hover:bg-slate-200 text-black font-black italic py-5 rounded-[25px] transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.2em] text-xs mt-4 shadow-xl"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
