"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useHaptic } from "@/lib/useHaptic";
import DialPad from "@/app/components/DialPad";
import { addTransaction } from "@/app/actions";
import { CATEGORY_EMOJI, CATEGORY_THEME } from "@/lib/constants";
import { useParticleBurst } from "@/lib/useParticleBurst";

const today = () => new Date().toISOString().split("T")[0];

export default function QuickAddFAB({ currentUser, expenseCats, capitalCats }) {
  const haptic = useHaptic();
  const { burst } = useParticleBurst();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Form State
  const [type, setType] = useState("expense");
  const [amountStr, setAmountStr] = useState("0");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus trap ref
  const lastFocusRef = useRef(null);
  const sheetRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const openSheet = useCallback(() => {
    haptic.medium();
    lastFocusRef.current = document.activeElement;
    setIsOpen(true);
    // Reset state
    setType("expense");
    setAmountStr("0");
    setDescription("");
    // Default category based on type
    setCategory(expenseCats[0] || "Other");
  }, [haptic, expenseCats]);

  const closeSheet = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => lastFocusRef.current?.focus(), 50);
  }, []);

  // Update default category when type changes
  useEffect(() => {
    if (type === "expense") setCategory(expenseCats[0] || "Other");
    else setCategory(capitalCats[0] || "Salary");
  }, [type, expenseCats, capitalCats]);

  const handleDialPad = useCallback((key) => {
    setAmountStr((prev) => {
      if (key === "DEL") {
        const next = prev.slice(0, -1);
        return next === "" ? "0" : next;
      }
      if (key === ".") {
        if (prev.includes(".")) return prev;
        return prev + ".";
      }
      if (prev === "0") return key;
      
      // Enforce max 2 decimal places
      if (prev.includes(".")) {
        const [, dec] = prev.split(".");
        if (dec && dec.length >= 2) return prev;
      }
      
      return prev + key;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const numAmount = parseFloat(amountStr);
    if (!description.trim()) {
       haptic.error();
       alert("Description is required.");
       return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
       haptic.error();
       alert("Valid amount is required.");
       return;
    }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.set("user", currentUser);
    fd.set("description", description.trim());
    fd.set("amount", numAmount);
    fd.set("type", type);
    fd.set("category", category);
    fd.set("date", today());

    try {
      await addTransaction(fd);
      haptic.success();
      if (type === "income" && sheetRef.current) burst(sheetRef.current);
      closeSheet();
    } catch (error) {
       haptic.error();
       alert("Target Error: " + error.message);
    } finally {
       setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const activeCategories = type === "income" ? capitalCats : expenseCats;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[90] ios-safe-bottom animate-in fade-in slide-in-from-bottom flex justify-end pointer-events-none">
        <button
          onClick={openSheet}
          aria-label="Quick add transaction"
          className="relative group flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 rounded-[24px] premium-glass bg-sky-500/20 border border-sky-400/30 text-sky-400 shadow-[0_10px_40px_rgba(56,189,248,0.4)] pointer-events-auto transition-all click-pop"
          onTouchStart={(e) => {
            haptic.light();
            e.currentTarget.style.transform = "scale(0.9)";
          }}
          onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <div className="absolute inset-0 rounded-[24px] bg-sky-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 relative z-10 transition-transform group-hover:rotate-90 duration-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/60 backdrop-blur-md animate-in fade-in"
          onClick={(e) => e.target === e.currentTarget && closeSheet()}
        >
          <div 
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
            className="w-full bg-[#080b12]/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] sm:rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] pb-safe-nav max-w-lg mx-auto transform animate-in slide-in-from-bottom"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer no-select" onClick={closeSheet}>
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-6 py-2 sm:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 id="quick-add-title" className="text-sm font-black italic tracking-widest text-white uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-pulse" />
                  Fast Entry
                </h2>
                <button onClick={closeSheet} className="text-slate-500 hover:text-white transition-colors p-2 -mr-2">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {/* Type Toggle */}
                <div className="flex rounded-2xl border border-white/5 bg-black/40 p-1" role="group">
                  {["expense", "income"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { haptic.light(); setType(t); }}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black italic tracking-widest uppercase transition-all duration-300 ${type === t
                        ? (t === "income" ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]")
                        : "text-slate-500 hover:text-white"
                        }`}
                    >
                      {t === "income" ? "Income" : "Expense"}
                    </button>
                  ))}
                </div>

                {/* Amount Output (Bound to DialPad) */}
                <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                  <p className="text-[10px] font-bold italic tracking-[0.2em] text-slate-500 uppercase mb-2">Amount</p>
                  <div className={`text-4xl sm:text-5xl font-black tracking-tighter truncate w-full text-center ${type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                    <span className="opacity-50 text-2xl mr-2">Rs.</span>
                    {amountStr}
                  </div>
                </div>

                {/* Description Input */}
                <input
                  type="text"
                  placeholder="DESCRIPTION..."
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-[16px] sm:text-sm font-semibold text-white outline-none focus:border-white/20 focus:bg-white/10 transition-colors uppercase placeholder:text-slate-600 placeholder:italic placeholder:font-bold placeholder:tracking-widest"
                />

                {/* Category Selector */}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-[16px] sm:text-sm font-bold text-white outline-none focus:border-white/20 focus:bg-white/10 transition-colors uppercase appearance-none"
                >
                  {activeCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#161b27]">
                       {CATEGORY_EMOJI[cat] ?? "📦"} {cat}
                    </option>
                  ))}
                </select>

                {/* Custom DialPad */}
                <DialPad onKeyPress={handleDialPad} />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || amountStr === "0" || amountStr === "0." || !description}
                  className={`mt-2 py-5 rounded-[20px] text-xs font-black italic tracking-[0.2em] uppercase transition-all shadow-xl click-pop disabled:opacity-50 ${type === "income"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                    }`}
                >
                  {isSubmitting ? "Processing..." : `Commit Entry`}
                </button>
                <div className="h-4" /> {/* Bottom safe padding */}
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
