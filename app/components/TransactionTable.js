"use client";
import { useState, useEffect } from "react";
// 🔥 වෙනස් කළා: updateTransaction කියන එකත් import කළා
import { deleteTransaction, updateTransaction } from "@/app/actions";
import { useRouter } from "next/navigation";

const CATEGORY_EMOJI = {
  Salary: "💼", Freelance: "🖊️", Investments: "📈", Business: "🏢", Bonus: "🎁",
  Food: "🍔", Transport: "🚌", Utilities: "⚡",
  Health: "🏥", Entertainment: "🎬", Education: "📚", Other: "📦",
};

const CATEGORIES = Object.keys(CATEGORY_EMOJI);

const fmt = (n) =>
  `Rs. ${new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

const fmtDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

export default function TransactionTable({ transactions }) {
  const router = useRouter();

  const [localTransactions, setLocalTransactions] = useState(transactions);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Delete States
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // 🚀 අලුත් Edit States
  const [editingTxn, setEditingTxn] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  const filtered = localTransactions.filter((t) => {
    const matchType = filter === "all" || t.type === filter;
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // ── DELETE LOGIC ──
  const askDelete = (id) => {
    setIdToDelete(id);
    setShowConfirm(true);
  };

  async function confirmDelete() {
    if (!idToDelete) return;
    const targetId = idToDelete;
    setDeletingId(targetId);
    setShowConfirm(false);
    setLocalTransactions(prev => prev.filter(t => t.id !== targetId));

    const fd = new FormData();
    fd.set("id", targetId);

    try {
      await deleteTransaction(fd);
      router.refresh();
    } catch (error) {
      alert("Error deleting: " + error.message);
      setLocalTransactions(transactions); // Revert on error
    } finally {
      setDeletingId(null);
      setIdToDelete(null);
    }
  }

  // ── 🚀 EDIT LOGIC ──
  const openEdit = (txn) => {
    setEditingTxn(txn);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.target);
    const updatedId = editingTxn.id;
    formData.set("id", updatedId);

    // Optimistic UI Update (ක්ෂණිකව පේන්න හදනවා)
    const updatedTxnObj = {
      ...editingTxn,
      type: formData.get("type"),
      amount: Number(formData.get("amount")),
      category: formData.get("category"),
      description: formData.get("description"),
      date: formData.get("date"),
    };

    setLocalTransactions(prev => prev.map(t => t.id === updatedId ? updatedTxnObj : t));
    setEditingTxn(null); // Close Modal

    try {
      await updateTransaction(formData);
      router.refresh();
    } catch (error) {
      alert("Error updating: " + error.message);
      setLocalTransactions(transactions); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="flex flex-col gap-6 relative w-full">

      {/* ── CUSTOM CONFIRMATION MODAL (DELETE) ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-[#161b27]/95 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/20">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-2.25a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25v2.25m6.75 0h-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-black italic tracking-widest text-white uppercase leading-tight">System Override</h3>
              <p className="mt-2 text-xs font-bold italic tracking-widest text-slate-400 uppercase leading-relaxed">
                Confirm permanent deletion?
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-3.5 text-[10px] font-black italic tracking-widest text-slate-400 uppercase transition-all">Abort</button>
              <button onClick={confirmDelete} className="flex-1 rounded-2xl bg-rose-600/20 border border-rose-500/50 py-3.5 text-[10px] font-black italic tracking-widest text-rose-400 uppercase transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)]">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 🚀 EDIT MODAL (GLASSMORPHISM) ── */}
      {editingTxn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#161b27]/95 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/20">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </div>
              <div>
                <h3 className="text-[14px] font-black italic tracking-widest text-white uppercase">Edit Record</h3>
                <p className="text-[9px] font-bold italic text-slate-400 uppercase tracking-widest">Update Data Values</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black italic tracking-widest text-slate-500 uppercase">Type</label>
                  <select name="type" defaultValue={editingTxn.type} className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs font-bold italic text-white outline-none focus:border-sky-500/50 uppercase">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black italic tracking-widest text-slate-500 uppercase">Date</label>
                  <input type="date" name="date" defaultValue={editingTxn.date} required className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs font-bold italic text-white outline-none focus:border-sky-500/50 [color-scheme:dark] uppercase" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black italic tracking-widest text-slate-500 uppercase">Amount (Rs.)</label>
                <input type="number" step="0.01" name="amount" defaultValue={editingTxn.amount} required className="rounded-xl border border-white/5 bg-black/40 p-3 text-lg font-black italic text-white outline-none focus:border-sky-500/50" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black italic tracking-widest text-slate-500 uppercase">Category</label>
                <select name="category" defaultValue={editingTxn.category} className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs font-bold italic text-white outline-none focus:border-sky-500/50 uppercase">
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{CATEGORY_EMOJI[cat]} {cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black italic tracking-widest text-slate-500 uppercase">Description</label>
                <input type="text" name="description" defaultValue={editingTxn.description} required className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs font-bold italic text-white outline-none focus:border-sky-500/50 uppercase" />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setEditingTxn(null)} className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-3.5 text-[10px] font-black italic tracking-widest text-slate-400 uppercase transition-all hover:bg-white/10">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 rounded-2xl bg-sky-600/20 border border-sky-500/50 py-3.5 text-[10px] font-black italic tracking-widest text-sky-400 uppercase transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:bg-sky-500/30">
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Header & Controls ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-2 w-full">
        <div className="flex items-center gap-4">
          <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 sm:h-6 sm:w-6">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-[12px] sm:text-[15px] font-black italic tracking-[0.2em] sm:tracking-[0.3em] text-white uppercase">System Log</h2>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[8px] sm:text-[10px] font-bold italic tracking-widest text-slate-500 uppercase">
                {filtered.length} Records Synced
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 w-full sm:w-auto">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="QUERY LOG..."
            className="w-full sm:w-56 rounded-2xl border border-white/5 bg-[#161b27]/30 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-bold italic text-white outline-none focus:border-sky-500/50 uppercase"
          />

          <div className="flex gap-1.5 sm:gap-2 bg-[#161b27]/30 backdrop-blur-md p-1 rounded-2xl border border-white/5 w-full sm:w-auto">
            {["all", "income", "expense"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`flex-1 sm:flex-none rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-black italic tracking-widest uppercase transition-all ${filter === f ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-[24px] sm:rounded-[40px] border border-white/5 bg-[#161b27]/30 backdrop-blur-2xl shadow-2xl overflow-hidden w-full">
        <div className="w-full">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-white/5 bg-black/20 text-[7px] sm:text-[10px] font-black italic tracking-[0.2em] sm:tracking-[0.3em] text-slate-500 uppercase">
                <th className="px-3 sm:px-6 py-3 sm:py-5 w-[45%] sm:w-1/2">Entity</th>
                <th className="px-1 sm:px-6 py-3 sm:py-5 text-right w-[35%] sm:w-auto">Value</th>
                <th className="px-2 sm:px-6 py-3 sm:py-5 text-center w-[20%] sm:w-[120px]">Act</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((txn) => (
                <tr key={txn.id} className="group transition-all hover:bg-white/[0.02]">
                  <td className="px-3 sm:px-6 py-3 sm:py-5 overflow-hidden">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl text-sm sm:text-lg border ${txn.type === "income" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                        {CATEGORY_EMOJI[txn.category] ?? "📦"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-[14px] font-bold text-slate-200 uppercase truncate">{txn.description}</p>
                        <p className="text-[7px] sm:text-[9px] font-bold italic text-slate-500 uppercase truncate">{txn.category} <span className="hidden sm:inline">•</span> {fmtDate(txn.date)}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-1 sm:px-6 py-3 sm:py-5 text-right text-[11px] sm:text-[16px] font-black italic truncate ${txn.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                    {txn.type === "income" ? "+ " : "- "} {fmt(txn.amount)}
                  </td>

                  {/* 🚀 වෙනස් කළ තැන: Edit & Delete බට්න් දෙකම දාලා තියෙනවා */}
                  <td className="px-2 sm:px-6 py-3 sm:py-5 text-center">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      {/* EDIT BUTTON */}
                      <button
                        onClick={() => openEdit(txn)}
                        className="inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-sky-500/5 text-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400 border border-transparent hover:border-sky-500/20 transition-all"
                        title="Edit Record"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        disabled={deletingId === txn.id}
                        onClick={() => askDelete(txn.id)}
                        className="inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-rose-500/5 text-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all"
                        title="Delete Record"
                      >
                        {deletingId === txn.id ? (
                          <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent"></div>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-3 w-3 sm:h-4 sm:w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}