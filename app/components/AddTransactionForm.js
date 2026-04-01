"use client";
import { useState, useRef } from "react";
import { addTransaction } from "@/app/actions";

const today = () => new Date().toISOString().split("T")[0];

export default function AddTransactionForm({ currentUser, expenseCats, setExpenseCats, capitalCats, setCapitalCats }) {
  const [type, setType] = useState("expense");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef(null);

  const [newCatInput, setNewCatInput] = useState("");

  const isIncome = type === "income";
  const activeCategories = isIncome ? capitalCats : expenseCats;

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setSuccess(false);

    const formData = new FormData(formRef.current);

    try {
      await addTransaction(formData);
      setSuccess(true);
      formRef.current.reset();
      setType("expense");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Error adding transaction: " + error.message);
    } finally {
      setPending(false);
    }
  }

  const handleAddCategory = (e) => {
    e.preventDefault();
    const val = newCatInput.trim();
    if (!val) return;

    if (isIncome) {
      if (!capitalCats.includes(val)) {
        setCapitalCats([...capitalCats, val]);
      }
    } else {
      if (!expenseCats.includes(val)) {
        setExpenseCats([...expenseCats, val]);
      }
    }
    setNewCatInput("");
  };

  const deleteCat = (cat) => {
    if (isIncome) {
      setCapitalCats(capitalCats.filter(c => c !== cat));
    } else {
      setExpenseCats(expenseCats.filter(c => c !== cat));
    }
  };

  const userColor = currentUser === "DASUN" ? "text-sky-400" : "text-purple-400";
  const userBorder = currentUser === "DASUN" ? "border-sky-500/30" : "border-purple-500/30";
  const glowColor = isIncome ? "fuchsia-500" : "fuchsia-500"; // Keep fuchsia for base focus

  return (
    <div className="flex flex-col gap-6 sm:gap-10">

      {/* ── 1. DATA ENTRY TERMINAL ── */}
      <section className="animate-vibe rounded-[30px] sm:rounded-[40px] border border-white/5 premium-glass p-5 sm:p-10 shadow-2xl relative overflow-hidden">

        {/* Subtle Background Orb */}
        <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none ${isIncome ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}></div>

        <div className={`absolute top-0 right-4 sm:right-10 rounded-b-xl sm:rounded-b-2xl border-b border-x ${userBorder} bg-[#080b12]/80 px-4 sm:px-6 py-1.5 sm:py-2 backdrop-blur-md z-20 shadow-[0_5px_15px_rgba(0,0,0,0.5)]`}>
          <p className={`text-[8px] sm:text-[10px] font-black italic tracking-[0.3em] uppercase ${userColor}`}>
            TERMINAL: {currentUser}
          </p>
        </div>

        <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-6 mt-6 sm:mt-2 relative z-10">
          <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border ${isIncome ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'} transition-colors duration-500`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 sm:h-7 sm:w-7">
              <path d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[14px] sm:text-[18px] font-black italic tracking-widest sm:tracking-[0.3em] text-white uppercase truncate drop-shadow-md">Data Entry</h2>
            <p className="mt-1 text-[9px] sm:text-[11px] font-bold italic tracking-widest text-slate-400 uppercase truncate">Input encrypted transaction data</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-[9px] sm:text-[11px] font-black italic tracking-[0.3em] text-emerald-400 uppercase animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>
            TRANSACTION VERIFIED & LOGGED
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-8 relative z-10">
          <input type="hidden" name="user" value={currentUser} />

          <div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2">

            <div className="sm:col-span-2">
              <label className="mb-2 block text-[9px] sm:text-[11px] font-black italic tracking-[0.2em] text-slate-400 uppercase ml-1">Description</label>
              <input name="description" type="text" required placeholder="ENTRY IDENTIFIER..." className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-[16px] sm:text-[13px] font-bold italic tracking-widest text-white outline-none focus:border-transparent focus:ring-2 focus:ring-fuchsia-500/50 focus:bg-white/5 transition-all uppercase placeholder:text-slate-600 shadow-inner" />
            </div>

            <div>
              <label className="mb-2 block text-[9px] sm:text-[11px] font-black italic tracking-[0.2em] text-slate-400 uppercase ml-1">Amount (LKR)</label>
              <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-[16px] sm:text-[14px] font-black italic tracking-wider text-white outline-none focus:border-transparent focus:ring-2 focus:ring-fuchsia-500/50 focus:bg-white/5 transition-all placeholder:text-slate-600 shadow-inner" />
            </div>

            <div>
              <label className="mb-2 block text-[9px] sm:text-[11px] font-black italic tracking-[0.2em] text-slate-400 uppercase ml-1">Timestamp</label>
              <input name="date" type="date" required defaultValue={today()} className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-[16px] sm:text-[13px] font-bold italic tracking-wider text-white outline-none focus:border-transparent focus:ring-2 focus:ring-fuchsia-500/50 focus:bg-white/5 transition-all [color-scheme:dark] shadow-inner" />
            </div>

            {/* 🚀 UI Upgrade: Premium Segmented Control */}
            <div>
              <label className="mb-2 block text-[9px] sm:text-[11px] font-black italic tracking-[0.2em] text-slate-400 uppercase ml-1">Classification</label>
              <div className="flex rounded-2xl border border-white/10 bg-black/50 p-1.5 gap-1.5 shadow-inner">
                {["expense", "income"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`click-pop flex-1 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black italic tracking-widest uppercase transition-all duration-300 ${type === t
                        ? (t === "income" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]")
                        : "text-slate-500 hover:text-white border border-transparent hover:bg-white/5"
                      }`}
                  >
                    {t === "income" ? "Capital" : "Expense"}
                  </button>
                ))}
              </div>
              <input type="hidden" name="type" value={type} />
            </div>

            <div>
              <label className="mb-2 block text-[9px] sm:text-[11px] font-black italic tracking-[0.2em] text-slate-400 uppercase ml-1">Category</label>
              <select name="category" required className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-[16px] sm:text-[13px] font-bold italic tracking-widest text-white outline-none focus:border-transparent focus:ring-2 focus:ring-fuchsia-500/50 focus:bg-white/5 transition-all uppercase appearance-none cursor-pointer shadow-inner">
                {activeCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#080b12] text-white">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={pending} className={`click-pop mt-4 sm:mt-6 rounded-2xl py-4 sm:py-5 text-[10px] sm:text-[12px] font-black italic tracking-[0.3em] uppercase text-white transition-all duration-300 shadow-xl ${isIncome
              ? "bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:border-emerald-400/60"
              : "bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] hover:border-rose-400/60"
            }`}>
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                EXECUTING...
              </span>
            ) : (
              `COMMIT TO ${currentUser}`
            )}
          </button>
        </form>
      </section>

      {/* ── 2. CATEGORY MANAGER ── */}
      <section className="animate-vibe rounded-[30px] sm:rounded-[40px] border border-white/5 premium-glass p-5 sm:p-10 shadow-2xl relative overflow-hidden" style={{ animationDelay: '0.1s' }}>

        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none opacity-20 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

        <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4 border-b border-white/5 pb-4 sm:pb-5 relative z-10">
          <div className={`h-2 w-2 rounded-full animate-pulse ${isIncome ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-rose-400 shadow-[0_0_10px_#fb7185]'}`}></div>
          <h3 className={`text-[11px] sm:text-[14px] font-black italic tracking-[0.3em] uppercase truncate ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
            {type.toUpperCase()} MANAGER
          </h3>
        </div>

        <form onSubmit={handleAddCategory} className="mb-8 sm:mb-10 flex gap-2 sm:gap-3 relative z-10">
          <input type="text" value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} placeholder={`ADD NEW ${type.toUpperCase()}...`} className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-5 py-3 sm:py-4 text-[16px] sm:text-[11px] font-bold italic tracking-widest text-white outline-none focus:border-transparent focus:ring-2 focus:ring-white/20 transition-all uppercase shadow-inner placeholder:text-slate-600" />
          <button type="submit" className="click-pop rounded-2xl border border-white/10 bg-white/5 px-6 sm:px-10 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black italic tracking-[0.2em] text-white hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all">ADD</button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 relative z-10">
          {activeCategories.map(cat => (
            <div key={cat} className="group flex items-center justify-between rounded-xl sm:rounded-2xl border border-white/5 bg-black/30 px-4 sm:px-5 py-3 transition-all duration-300 hover:border-white/20 hover:bg-white/5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
              <span className="text-[9px] sm:text-[11px] font-bold italic tracking-widest text-slate-300 uppercase truncate max-w-[80px] sm:max-w-[120px]">{cat}</span>

              <button
                type="button"
                onClick={() => deleteCat(cat)}
                className="click-pop text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 p-2 rounded-lg transition-all flex shrink-0 items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}