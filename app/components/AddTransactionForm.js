"use client";
import { useState, useRef } from "react";
import { addTransaction } from "@/app/actions";

const today = () => new Date().toISOString().split("T")[0];

// 🚀 වෙනස් කළ තැන: Props වලින් එන Functions පාවිච්චි කරනවා (setExpenseCats / setCapitalCats)
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

  // 🚀 වෙනස් කළ තැන: අලුත් Category එකක් දැම්මම ඒක Main Component එකේ Function එකට යවනවා
  const handleAddCategory = (e) => {
    e.preventDefault();
    const val = newCatInput.trim();
    if (!val) return;

    if (isIncome) {
      if (!capitalCats.includes(val)) {
        setCapitalCats([...capitalCats, val]); // මේකෙන් Local Storage එකටත් Save වෙනවා
      }
    } else {
      if (!expenseCats.includes(val)) {
        setExpenseCats([...expenseCats, val]); // මේකෙන් Local Storage එකටත් Save වෙනවා
      }
    }
    setNewCatInput("");
  };

  // 🚀 වෙනස් කළ තැන: Category එකක් මැකුවමත් ඒක Main Component එකේ Function එකට යවනවා
  const deleteCat = (cat) => {
    if (isIncome) {
      setCapitalCats(capitalCats.filter(c => c !== cat));
    } else {
      setExpenseCats(expenseCats.filter(c => c !== cat));
    }
  };

  const userColor = currentUser === "DASUN" ? "text-sky-400" : "text-purple-400";
  const userBorder = currentUser === "DASUN" ? "border-sky-500/30" : "border-purple-500/30";

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      {/* 1. DATA ENTRY TERMINAL */}
      <section className="rounded-[24px] sm:rounded-[40px] border border-white/5 bg-[#161b27]/30 p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden">
        <div className={`absolute top-0 right-4 sm:right-8 rounded-b-xl sm:rounded-b-2xl border-b border-x ${userBorder} bg-black/40 px-3 sm:px-6 py-1.5 sm:py-2 backdrop-blur-md z-20`}>
          <p className={`text-[8px] sm:text-[10px] font-black italic tracking-widest uppercase ${userColor}`}>
            TERMINAL: {currentUser}
          </p>
        </div>

        <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4 border-b border-white/5 pb-4 sm:pb-6 mt-6 sm:mt-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
              <path d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[12px] sm:text-[15px] font-black italic tracking-widest sm:tracking-[0.3em] text-white uppercase truncate">Data Entry</h2>
            <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] font-bold italic tracking-wider sm:tracking-widest text-slate-500 uppercase truncate">Input encrypted transaction data</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 sm:p-4 text-[8px] sm:text-[10px] font-black italic tracking-widest text-emerald-400 uppercase animate-pulse">
            TRANSACTION VERIFIED & LOGGED
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
          <input type="hidden" name="user" value={currentUser} />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 sm:mb-2 block text-[8px] sm:text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase">Description</label>
              <input name="description" type="text" required placeholder="ENTRY IDENTIFIER..." className="w-full rounded-xl sm:rounded-2xl border border-white/5 bg-black/40 px-4 sm:px-5 py-3 sm:py-4 text-[16px] sm:text-xs font-bold italic tracking-widest text-white outline-none focus:border-fuchsia-500/50 transition-all uppercase" />
            </div>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-[8px] sm:text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase">Amount (LKR)</label>
              <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full rounded-xl sm:rounded-2xl border border-white/5 bg-black/40 px-4 sm:px-5 py-3 sm:py-4 text-[16px] sm:text-xs font-bold italic text-white outline-none focus:border-fuchsia-500/50 transition-all" />
            </div>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-[8px] sm:text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase">Timestamp</label>
              <input name="date" type="date" required defaultValue={today()} className="w-full rounded-xl sm:rounded-2xl border border-white/5 bg-black/40 px-4 sm:px-5 py-3 sm:py-4 text-[16px] sm:text-xs font-bold italic text-white outline-none focus:border-fuchsia-500/50 [color-scheme:dark]" />
            </div>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-[8px] sm:text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase">Classification</label>
              <div className="flex rounded-xl sm:rounded-2xl border border-white/5 bg-black/40 p-1 gap-1">
                {["expense", "income"].map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black italic tracking-widest uppercase transition-all ${type === t ? (t === "income" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400") : "text-slate-600 hover:text-white"}`}>
                    {t === "income" ? "Capital" : "Expense"}
                  </button>
                ))}
              </div>
              <input type="hidden" name="type" value={type} />
            </div>

            <div>
              <label className="mb-1.5 sm:mb-2 block text-[8px] sm:text-[10px] font-black italic tracking-[0.2em] text-slate-500 uppercase">Category</label>
              <select name="category" required className="w-full rounded-xl sm:rounded-2xl border border-white/5 bg-black/40 px-4 sm:px-5 py-3 sm:py-4 text-[16px] sm:text-xs font-bold italic text-white outline-none focus:border-fuchsia-500/50 uppercase appearance-none cursor-pointer">
                {activeCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#161b27]">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={pending} className={`mt-2 sm:mt-4 rounded-xl sm:rounded-2xl py-4 sm:py-5 text-[9px] sm:text-[11px] font-black italic tracking-widest sm:tracking-[0.3em] uppercase text-white transition-all shadow-xl ${isIncome ? "bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/30" : "bg-rose-600/20 border border-rose-500/50 hover:bg-rose-600/30"}`}>
            {pending ? "EXECUTING..." : `COMMIT TRANSACTION TO ${currentUser}`}
          </button>
        </form>
      </section>

      {/* 2. CATEGORY MANAGER */}
      <section className="rounded-[24px] sm:rounded-[40px] border border-white/5 bg-[#161b27]/30 p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4 border-b border-white/5 pb-3 sm:pb-4">
          <h3 className={`text-[10px] sm:text-[13px] font-black italic tracking-widest sm:tracking-[0.3em] uppercase truncate ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
            {type.toUpperCase()} MANAGER
          </h3>
        </div>

        <form onSubmit={handleAddCategory} className="mb-6 sm:mb-8 flex gap-2 sm:gap-3">
          <input type="text" value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} placeholder={`ADD NEW ${type.toUpperCase()}...`} className="flex-1 rounded-xl sm:rounded-2xl border border-white/5 bg-black/40 px-4 sm:px-5 py-2.5 sm:py-3 text-[16px] sm:text-[10px] font-bold italic text-white outline-none focus:border-white/20 uppercase" />
          <button type="submit" className="rounded-xl sm:rounded-2xl bg-white/5 px-6 sm:px-8 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-black italic text-white hover:bg-white/10 transition-all">ADD</button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {activeCategories.map(cat => (
            <div key={cat} className="group flex items-center justify-between rounded-lg sm:rounded-xl border border-white/5 bg-black/20 px-3 sm:px-4 py-2 sm:py-2.5 transition-all hover:border-white/10">
              <span className="text-[8px] sm:text-[10px] font-bold italic tracking-wider sm:tracking-widest text-slate-400 uppercase truncate max-w-[80px] sm:max-w-full">{cat}</span>

              <button
                type="button"
                onClick={() => deleteCat(cat)}
                className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1 sm:p-1.5 rounded-md transition-all flex shrink-0 items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
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