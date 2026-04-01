"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useHaptic } from "@/lib/useHaptic";
import DialPad from "@/app/components/DialPad";
import { addTransaction } from "@/app/actions";
import { CATEGORY_EMOJI } from "@/lib/constants";
import { useParticleBurst } from "@/lib/useParticleBurst";

const today = () => new Date().toISOString().split("T")[0];

export default function QuickAddFAB({ currentUser, expenseCats, capitalCats, activeTab }) {
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

  // Focus trap & sheet ref
  const lastFocusRef = useRef(null);
  const sheetRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const openSheet = useCallback(() => {
    haptic.medium();
    lastFocusRef.current = document.activeElement;
    setIsOpen(true);
    setType("expense");
    setAmountStr("0");
    setDescription("");
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
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const activeCategories = type === "income" ? capitalCats : expenseCats;

  return (
    <>
      {/*
        OPT-18: FAB wrapper uses will-change:transform via the transition
        classes so iOS composites the hide/show animation from the GPU layer.
        The FAB is positioned above the bottom nav using env(safe-area-inset-bottom)
        so it never overlaps the home indicator bar.
        min-h/w of 56px (14*4) exceeds the 44pt Apple HIG tap target minimum.
      */}
      <div
        className={`fixed z-[90] right-4 sm:right-[calc(50%-210px)] flex justify-end pointer-events-none gpu-promote transition-all duration-300 ${activeTab === "CONTROL" ? "opacity-0 translate-y-10 scale-90 pointer-events-none" : "opacity-100 translate-y-0 scale-100"}`}
        style={{
          bottom: "calc(max(1.25rem, env(safe-area-inset-bottom)) + 5rem)",
        }}
      >
        <button
          onClick={openSheet}
          aria-label="Quick add transaction"
          className="relative group flex items-center justify-center w-14 h-14 rounded-[24px] premium-glass bg-sky-500/20 border border-sky-400/30 text-sky-400 shadow-[0_10px_40px_rgba(56,189,248,0.4)] pointer-events-auto transition-all click-pop gpu-promote"
          onTouchStart={(e) => {
            haptic.light();
            e.currentTarget.style.transform = "scale(0.9) translateZ(0)";
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = "scale(1) translateZ(0)";
          }}
        >
          <div className="absolute inset-0 rounded-[24px] bg-sky-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 relative z-10 transition-transform group-hover:rotate-90 duration-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {isOpen && createPortal(
        /*
          OPT-19: Bottom sheet portal.
          - Overlay uses backdrop-blur-md which is GPU-composited by WebKit.
          - The sheet itself gets `sheet-enter` class which has `will-change:
            transform, opacity` declared UPFRONT in globals.css, so the GPU
            layer is promoted before the animation starts (avoids mid-animation
            promotion jank).
          - pb uses env(safe-area-inset-bottom) to keep the submit button
            above the iPhone home indicator on all screen sizes.
          - max-h uses dvh (dynamic viewport height) so the sheet doesn't
            overflow when the iOS keyboard pushes the viewport up.
        */
        <div
          className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/60 animate-in fade-in duration-300"
          style={{
            WebkitBackdropFilter: "blur(8px)",
            backdropFilter: "blur(8px)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeSheet(); }}
        >
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
            className="sheet-enter w-full bg-[#080b12]/95 border-t border-white/10 rounded-t-[32px] sm:rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] max-w-lg mx-auto flex flex-col max-h-[96dvh] sm:max-h-[90dvh]"
            style={{
              WebkitBackdropFilter: "blur(20px)",
              backdropFilter: "blur(20px)",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer no-select shrink-0 z-10" onClick={closeSheet}>
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-6 py-2 sm:px-8 overflow-y-auto w-full flex-1 min-h-0 touch-pan-y">
              {/* Sticky Header */}
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#080b12]/95 pt-2 pb-4 z-20 border-b border-white/5">
                <h2 id="quick-add-title" className="text-[14px] sm:text-base font-black italic tracking-widest text-white uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)] animate-pulse" />
                  Fast Entry
                </h2>
                {/* OPT-20: Close button meets 44pt min tap target */}
                <button
                  onClick={closeSheet}
                  aria-label="Close"
                  className="ml-auto flex shrink-0 items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Type Toggle */}
                <div className="flex rounded-2xl border border-white/5 bg-black/40 p-1 shrink-0" role="group">
                  {["expense", "income"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { haptic.light(); setType(t); }}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black italic tracking-widest uppercase transition-all duration-300 min-h-[44px] ${type === t
                        ? (t === "income" ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)] border border-rose-500/30")
                        : "text-slate-500 hover:text-white border border-transparent"
                        }`}
                    >
                      {t === "income" ? "Income" : "Expense"}
                    </button>
                  ))}
                </div>

                {/* Amount Display */}
                <div className="flex flex-col items-center justify-center py-2 sm:py-4 shrink-0">
                  <p className="text-[9px] font-bold italic tracking-[0.2em] text-slate-500 uppercase mb-1">Amount</p>
                  <div className={`text-4xl sm:text-5xl font-black tracking-tighter truncate w-full text-center ${type === "income" ? "text-gradient-premium" : "text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]"}`}>
                    <span className="opacity-50 text-2xl mr-2 text-slate-400 bg-none drop-shadow-none">Rs.</span>
                    {amountStr}
                  </div>
                </div>

                {/* Input Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                  <input
                    type="text"
                    placeholder="DESCRIPTION..."
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-black/40 px-5 py-4 text-[16px] font-semibold text-white outline-none focus:border-sky-500/50 transition-colors uppercase placeholder:text-slate-600 placeholder:italic placeholder:font-bold placeholder:tracking-widest"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-black/40 px-5 py-4 text-[16px] font-bold text-white outline-none focus:border-sky-500/50 transition-colors uppercase appearance-none"
                  >
                    {activeCategories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#161b27]">
                        {CATEGORY_EMOJI[cat] ?? "📦"} {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom DialPad */}
                <div className="shrink-0 my-1 sm:my-2">
                  <DialPad onKeyPress={handleDialPad} />
                </div>

                {/* Spacer for sticky footer */}
                <div className="h-6 sm:h-8 shrink-0" />

                {/* Submit — sticky at sheet bottom */}
                <div className="sticky bottom-0 bg-[#080b12]/95 pt-4 pb-4 sm:pb-6 z-20 border-t border-white/5 -mx-6 px-6 sm:-mx-8 sm:px-8 mt-auto shrink-0">
                  <button
                    type="submit"
                    disabled={isSubmitting || amountStr === "0" || amountStr === "0." || !description}
                    className={`w-full py-4 sm:py-5 rounded-[20px] text-[12px] sm:text-sm font-black italic tracking-[0.2em] uppercase transition-all click-pop disabled:opacity-50 min-h-[52px] ${type === "income"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                      }`}
                  >
                    {isSubmitting ? "Processing..." : "Commit Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
