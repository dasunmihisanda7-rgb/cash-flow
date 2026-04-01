"use client";
import { useState, useEffect, useRef } from "react";
import { deleteTransaction, updateTransaction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useHaptic } from "@/lib/useHaptic";
import { createPortal } from "react-dom";[span_7](start_span)// 🚀 React Portal for Modals[span_7](end_span)

const CATEGORY_EMOJI = {
  Salary: "💼", Freelance: "🖊️", Investments: "📈", Business: "🏢", Bonus: "🎁",
  Food: "🍔", Transport: "🚌", Utilities: "⚡",
  Health: "🏥", Entertainment: "🎬", Education: "📚", Other: "📦",
};

const fmt = (n) => `Rs. ${new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
const fmtDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function TransactionTable({ transactions, expenseCats = [], capitalCats = [] }) {
  const router = useRouter();
  const haptic = useHaptic();

  const [localTransactions, setLocalTransactions] = useState(transactions);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const [editingTxn, setEditingTxn] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  [span_8](start_span)// 🚀 Per-Row Swipe State (Fixes Bug #1)[span_8](end_span)
  const [swipedId, setSwipedId] = useState(null);
  const [swipeOffsets, setSwipeOffsets] = useState({});
  const rowStartPositions = useRef({});

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  const filtered = localTransactions.filter((t) => {
    const matchType = filter === "all" || t.type === filter;
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const askDelete = (id) => {
    haptic.error();
    setIdToDelete(id);
    setShowConfirm(true);
  };

  async function confirmDelete() {
    if (!idToDelete) return;
    const targetId = idToDelete;
    setDeletingId(targetId);

    // Close Modal & Reset Swipe
    setShowConfirm(false);
    setSwipedId(null);
    setSwipeOffsets(prev => ({ ...prev, [targetId]: 0 }));

    setLocalTransactions(prev => prev.filter(t => t.id !== targetId));

    const fd = new FormData();
    fd.set("id", targetId);

    try {
      await deleteTransaction(fd);
      router.refresh();
      haptic.success();
    } catch (error) {
      alert("Error deleting: " + error.message);
      setLocalTransactions(transactions);
    } finally {
      setDeletingId(null);
      setIdToDelete(null);
    }
  }

  const cancelDelete = () => {
    setShowConfirm(false);
    if (idToDelete) {
      setSwipedId(null);
      setSwipeOffsets(prev => ({ ...prev, [idToDelete]: 0 }));[span_9](start_span)// Reset row[span_9](end_span)
    }
    setIdToDelete(null);
  };

  const openEdit = (txn) => {
    haptic.light();
    setEditingTxn(txn);
    if (swipedId) {
      setSwipedId(null);
      setSwipeOffsets(prev => ({ ...prev, [swipedId]: 0 }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.target);
    const updatedId = editingTxn.id;
    formData.set("id", updatedId);

    const updatedTxnObj = {
      ...editingTxn,
      type: formData.get("type"),
      amount: Number(formData.get("amount")),
      category: formData.get("category"),
      description: formData.get("description"),
      date: formData.get("date"),
    };

    setLocalTransactions(prev => prev.map(t => t.id === updatedId ? updatedTxnObj : t));
    setEditingTxn(null);

    try {
      await updateTransaction(formData);
      router.refresh();
      haptic.success();
    } catch (error) {
      alert("Error updating: " + error.message);
      setLocalTransactions(transactions);
    } finally {
      setIsUpdating(false);
    }
  };

  const activeEditCategories = editingTxn?.type === "income" ? capitalCats : expenseCats;

  [span_10](start_span)[span_11](start_span)// 🚀 React Portal Modals (Fixes Bug #4)[span_10](end_span)[span_11](end_span)
  const renderConfirmModal = () => {
    if (!showConfirm) return null;
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="w-full max-w-[320px] sm:max-w-sm rounded-[24px] sm:rounded-[32px] border border-white/10 bg-[#161b27]/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/20">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-2.25a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25v2.25m6.75 0h-13.5" /></svg>
            </div>
            <h3 className="text-[16px] sm:text-lg font-black italic tracking-widest text-white uppercase leading-tight">System Override</h3>
            <p className="mt-2 text-[10px] sm:text-xs font-bold italic tracking-widest text-slate-400 uppercase leading-relaxed">Confirm permanent deletion?</p>
          </div>
          <div className="flex gap-3">
            <button onClick={cancelDelete} className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black italic tracking-widest text-slate-400 uppercase transition-all">Abort</button>
            <button onClick={confirmDelete} className="click-pop flex-1 rounded-2xl bg-rose-600/20 border border-rose-500/50 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black italic tracking-widest text-rose-400 uppercase transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)]">Delete</button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const renderEditModal = () => {
    if (!editingTxn) return null;
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-md rounded-[24px] sm:rounded-[32px] border border-white/10 bg-[#161b27]/95 p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/20 max-h-[90dvh] overflow-y-auto">
          <div className="mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4 sticky top-0 bg-[#161b27]/95 pt-2 pb-4 z-10 border-b border-white/5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
            </div>
            <div>
              <h3 className="text-[12px] sm:text-[14px] font-black italic tracking-widest text-white uppercase">Edit Record</h3>
              <p className="text-[8px] sm:text-[9px] font-bold italic text-slate-400 uppercase tracking-widest mt-0.5">Update Data Values</p>
            </div>
          </div>
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] sm:text-[9px] font-black italic tracking-widest text-slate-500 uppercase ml-1">Type</label>
                <select name="type" value={editingTxn.type} onChange={(e) => setEditingTxn({ ...editingTxn, type: e.target.value })} className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-[14px] sm:text-xs font-bold italic text-white outline-none focus:border-sky-500/50 uppercase"><option value="income">Income</option><option value="expense">Expense</option></select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] sm:text-[9px] font-black italic tracking-widest text-slate-500 uppercase ml-1">Date</label>
                <input type="date" name="date" defaultValue={editingTxn.date} required className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-[14px] sm:text-xs font-bold italic text-white outline-none focus:border-sky-500/50 [color-scheme:dark] uppercase" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] sm:text-[9px] font-black italic tracking-widest text-slate-500 uppercase ml-1">Amount (Rs.)</label>
              <input type="number" step="0.01" name="amount" defaultValue={editingTxn.amount} required className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-[14px] sm:text-lg font-black italic text-white outline-none focus:border-sky-500/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] sm:text-[9px] font-black italic tracking-widest text-slate-500 uppercase ml-1">Category</label>
              <select name="category" defaultValue={editingTxn.category} className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-[14px] sm:text-xs font-bold italic text-white outline-none focus:border-sky-500/50 uppercase appearance-none">
                {activeEditCategories.map(cat => (<option key={cat} value={cat} className="bg-[#161b27]">{CATEGORY_EMOJI[cat] ?? "📦"} {cat}</option>))}
                {!activeEditCategories.includes(editingTxn.category) && (<option key={editingTxn.category} value={editingTxn.category} className="bg-[#161b27]">📦 {editingTxn.category}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] sm:text-[9px] font-black italic tracking-widest text-slate-500 uppercase ml-1">Description</label>
              <input type="text" name="description" defaultValue={editingTxn.description} required className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-[14px] sm:text-xs font-bold italic text-white outline-none focus:border-sky-500/50 uppercase" />
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-white/5 sticky bottom-0 bg-[#161b27]/95">
              <button type="button" onClick={() => setEditingTxn(null)} className="flex-1 rounded-xl border border-white/5 bg-white/5 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black italic tracking-widest text-slate-400 uppercase transition-all hover:bg-white/10">Cancel</button>
              <button type="submit" disabled={isUpdating} className="click-pop flex-1 rounded-xl bg-sky-600/20 border border-sky-500/50 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black italic tracking-widest text-sky-400 uppercase transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:bg-sky-500/30">{isUpdating ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <section className="flex flex-col gap-6 relative w-full">

      {mounted && renderConfirmModal()}
      {mounted && renderEditModal()}

      {/* Header & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-2 w-full">
        <div className="flex items-center gap-4">
          <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 sm:h-6 sm:w-6"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
          </div>
          <div>
            <h2 className="text-[12px] sm:text-[15px] font-black italic tracking-[0.2em] sm:tracking-[0.3em] text-white uppercase">System Log</h2>
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[8px] sm:text-[10px] font-bold italic tracking-widest text-slate-500 uppercase">{filtered.length} Records Synced</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 w-full sm:w-auto">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="QUERY LOG..." className="w-full sm:w-56 rounded-2xl border border-white/5 bg-[#161b27]/30 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 text-[16px] sm:text-[11px] font-bold italic text-white outline-none focus:border-sky-500/50 uppercase" />
          <div className="flex gap-1.5 sm:gap-2 bg-[#161b27]/30 backdrop-blur-md p-1 rounded-2xl border border-white/5 w-full sm:w-auto">
            {["all", "income", "expense"].map((f) => (
              <button key={f} onClick={() => { haptic.light(); setFilter(f); }} className={`flex-1 sm:flex-none rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-black italic tracking-widest uppercase transition-all ${filter === f ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 🚀 Data List with Bulletproof Swipe-to-Delete */}
      <div className="rounded-[24px] sm:rounded-[40px] border border-white/5 scroll-glass p-3 sm:p-5 flex flex-col gap-2 w-full">
        {filtered.map((txn) => {
          const currentOffset = swipeOffsets[txn.id] || 0;
          const isSwipedOpen = swipedId === txn.id;

          return (
            <div
              key={txn.id}
              className="relative overflow-hidden rounded-2xl border border-transparent bg-transparent hover:border-white/10"
              [span_12](start_span)[span_13](start_span)[span_14](start_span)// 🚀 Pointer Events Fixes (Capture pointer, Stop Propagation)[span_12](end_span)[span_13](end_span)[span_14](end_span)
          onPointerDown = {(e) => {
          e.stopPropagation(); // Stop tab swipe from triggering
        e.target.setPointerCapture(e.pointerId); // Don't lose finger
        rowStartPositions.current[txn.id] = e.clientX;
              }}
        onPointerMove={(e) => {
          if (rowStartPositions.current[txn.id] == null) return;
          const dx = e.clientX - rowStartPositions.current[txn.id];

          if (dx < 0 && !isSwipedOpen) {
            setSwipeOffsets(prev => ({ ...prev, [txn.id]: Math.max(dx, -90) }));
          } else if (dx > 0 && isSwipedOpen) {
            [span_15](start_span)// Allow swiping back to close[span_15](end_span)
            setSwipeOffsets(prev => ({ ...prev, [txn.id]: Math.min(-90 + dx, 0) }));
          }
        }}
        onPointerUp={(e) => {
          e.target.releasePointerCapture(e.pointerId);
          const offset = swipeOffsets[txn.id] || 0;

          if (offset < -60) {
            haptic.medium();
            setSwipedId(txn.id);
            setSwipeOffsets(prev => ({ ...prev, [txn.id]: -90 }));
          } else {
            setSwipedId(null);
            setSwipeOffsets(prev => ({ ...prev, [txn.id]: 0 }));
          }
          rowStartPositions.current[txn.id] = null;
        }}
        onPointerCancel={(e) => {
          e.target.releasePointerCapture(e.pointerId);
          if (!isSwipedOpen) setSwipeOffsets(prev => ({ ...prev, [txn.id]: 0 }));
          rowStartPositions.current[txn.id] = null;
        }}
            >
        {/* Delete Zone */}
        <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center bg-rose-500/20 border-l border-rose-500/30" style={{ opacity: isSwipedOpen ? 1 : Math.abs(currentOffset) / 100 }}>
          [span_16](start_span){/* 🚀 Removed click-pop to stop transition glitch[span_16](end_span) */}
          <button onClick={() => askDelete(txn.id)} className="w-full h-full flex flex-col items-center justify-center text-rose-400 gap-1 active:bg-rose-500/30 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-2.25a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25v2.25m6.75 0h-13.5" /></svg>
            <span className="text-[9px] font-black italic tracking-widest uppercase">Delete</span>
          </button>
        </div>

        {/* Content Zone */}
        <div
          className="flex items-center justify-between p-3 sm:p-4 bg-[#161b27]/40 cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${isSwipedOpen ? -90 : currentOffset}px)`,
            transition: rowStartPositions.current[txn.id] != null ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden" onClick={() => { if (!isSwipedOpen) openEdit(txn); }}>
            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-lg sm:text-xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-3deg] ${txn.type === "income" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
              <span className={`absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity ${txn.type === "income" ? "border border-emerald-500/40" : "border border-rose-500/40"}`} />
              {CATEGORY_EMOJI[txn.category] ?? "📦"}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-[14px] font-bold text-slate-200 uppercase truncate">{txn.description}</p>
              <p className="text-[9px] sm:text-[10px] font-bold italic text-slate-500 uppercase truncate mt-0.5">{txn.category} • {fmtDate(txn.date)}</p>
            </div>
          </div>
          <div className={`text-right text-[12px] sm:text-[15px] font-black italic truncate shrink-0 ml-4 ${txn.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
            {txn.type === "income" ? "+ " : "- "} {fmt(txn.amount)}
          </div>
        </div>
      </div>
      );
        })}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
          <p className="text-[10px] font-bold italic tracking-widest text-slate-400 uppercase">No records found</p>
        </div>
      )}
    </div>

    </section >
  );
}