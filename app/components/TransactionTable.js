"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { deleteTransaction, updateTransaction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useHaptic } from "@/lib/useHaptic";
import { createPortal } from "react-dom";
// PERF-02 FIX: Import shared CATEGORY_EMOJI and CATEGORY_THEME from constants instead of duplicating it.
import { CATEGORY_EMOJI, CATEGORY_THEME } from "@/lib/constants";

const fmt = (n) => `Rs. ${new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

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

  // UX Batch 2: Inline Editing State
  const [inlineEditDesc, setInlineEditDesc] = useState(null);
  const [inlineEditAmount, setInlineEditAmount] = useState(null);

  // UX-07 FIX: Toast state replaces jarring browser alert() on errors.
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 4000);
  }, []);

  // UX-01 FIX: Track the element that triggered the modal so we can restore
  // focus when the modal closes (keyboard / screen reader accessibility).
  const lastFocusRef = useRef(null);

  // Per-row swipe state
  const [swipedId, setSwipedId] = useState(null);
  const [swipeOffsets, setSwipeOffsets] = useState({});
  const rowStartPositions = useRef({});

  // Only render portals after client mount (avoids SSR mismatch)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // BUG-09 FIX: Prune orphaned swipe offsets when the transaction list changes.
  useEffect(() => {
    setLocalTransactions(transactions);
    const ids = new Set(transactions.map((t) => t.id));
    setSwipeOffsets((prev) => {
      const next = {};
      for (const [k, v] of Object.entries(prev)) {
        if (ids.has(k)) next[k] = v;
      }
      return next;
    });
  }, [transactions]);

  // UX-05 FIX: "Peek" animation on the first row on first load so users
  // discover the swipe-to-delete gesture, stored in sessionStorage so it
  // only plays once per session.
  useEffect(() => {
    const shown = sessionStorage.getItem("swipe-hint-shown");
    if (!shown && transactions.length > 0) {
      const firstId = transactions[0].id;
      const t1 = setTimeout(() => {
        setSwipeOffsets((prev) => ({ ...prev, [firstId]: -22 }));
        const t2 = setTimeout(() => {
          setSwipeOffsets((prev) => ({ ...prev, [firstId]: 0 }));
        }, 600);
        return () => clearTimeout(t2);
      }, 900);
      sessionStorage.setItem("swipe-hint-shown", "1");
      return () => clearTimeout(t1);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Intersection Observer for scroll-driven entrances
  const observerRef = useRef(null);
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
          observerRef.current.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    return () => observerRef.current?.disconnect();
  }, []);

  const uniqueCategories = Array.from(new Set(localTransactions.map(t => t.category)));
  const filterOptions = ["all", "income", "expense", ...uniqueCategories];

  const filtered = localTransactions.filter((t) => {
    let matchFilter = filter === "all";
    if (filter === "income" || filter === "expense") matchFilter = t.type === filter;
    else if (filter !== "all") matchFilter = t.category === filter;

    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // ── Delete flow ──────────────────────────────────────────────────────────
  const askDelete = useCallback((id, triggerEl) => {
    haptic.error();
    lastFocusRef.current = triggerEl || document.activeElement;
    setIdToDelete(id);
    setShowConfirm(true);
  }, [haptic]);

  const confirmDelete = useCallback(async () => {
    if (!idToDelete) return;
    const targetId = idToDelete;
    // BUG-03 FIX: Capture snapshot BEFORE mutation so error recovery is always
    // correct even if a router.refresh() happens between the async call and catch.
    const snapshot = [...localTransactions];

    setDeletingId(targetId);
    setShowConfirm(false);
    setSwipedId(null);
    setSwipeOffsets((prev) => ({ ...prev, [targetId]: 0 }));
    setLocalTransactions((prev) => prev.filter((t) => t.id !== targetId));
    setIdToDelete(null);

    // Restore focus to the triggering element after modal closes
    setTimeout(() => lastFocusRef.current?.focus(), 50);

    const fd = new FormData();
    fd.set("id", targetId);

    try {
      await deleteTransaction(fd);
      router.refresh();
      haptic.success();
    } catch (error) {
      // BUG-03 FIX: Use the local snapshot, not the `transactions` prop.
      setLocalTransactions(snapshot);
      // UX-07 FIX: Toast instead of alert()
      showToast("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }, [idToDelete, localTransactions, router, haptic, showToast]);

  const cancelDelete = useCallback(() => {
    setShowConfirm(false);
    if (idToDelete) {
      setSwipedId(null);
      setSwipeOffsets((prev) => ({ ...prev, [idToDelete]: 0 }));
    }
    setIdToDelete(null);
    setTimeout(() => lastFocusRef.current?.focus(), 50);
  }, [idToDelete]);

  // ── Edit flow ────────────────────────────────────────────────────────────
  const openEdit = useCallback((txn, triggerEl) => {
    haptic.light();
    lastFocusRef.current = triggerEl || document.activeElement;
    setEditingTxn(txn);
    if (swipedId) {
      setSwipedId(null);
      setSwipeOffsets((prev) => ({ ...prev, [swipedId]: 0 }));
    }
  }, [haptic, swipedId]);

  const closeEdit = useCallback(() => {
    setEditingTxn(null);
    setTimeout(() => lastFocusRef.current?.focus(), 50);
  }, []);

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.target);
    const updatedId = editingTxn.id;
    formData.set("id", updatedId);

    // BUG-03 FIX: Capture optimistic snapshot before mutation.
    const snapshot = [...localTransactions];
    const updatedTxnObj = {
      ...editingTxn,
      type: formData.get("type"),
      amount: Number(formData.get("amount")),
      category: formData.get("category"),
      description: formData.get("description"),
      date: formData.get("date"),
    };

    setLocalTransactions((prev) => prev.map((t) => (t.id === updatedId ? updatedTxnObj : t)));
    closeEdit();

    try {
      await updateTransaction(formData);
      router.refresh();
      haptic.success();
    } catch (error) {
      setLocalTransactions(snapshot);
      showToast("Failed to update. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }, [editingTxn, localTransactions, router, haptic, closeEdit, showToast]);

  const handleInlineUpdate = useCallback(async (txn, field, newValue) => {
    if (String(txn[field]) === String(newValue) || !newValue) {
      setInlineEditDesc(null);
      setInlineEditAmount(null);
      return;
    }

    // Lock out swipe to prevent conflicts
    setSwipedId(null);
    setSwipeOffsets((prev) => ({ ...prev, [txn.id]: 0 }));

    const snapshot = [...localTransactions];
    const updatedTxnObj = { ...txn, [field]: field === 'amount' ? Number(newValue) : newValue };
    setLocalTransactions((prev) => prev.map((t) => (t.id === txn.id ? updatedTxnObj : t)));
    
    setInlineEditDesc(null);
    setInlineEditAmount(null);

    const fd = new FormData();
    fd.set("id", txn.id);
    fd.set("user", txn.user || "DASUN");
    fd.set("description", field === 'description' ? newValue : txn.description);
    fd.set("amount", field === 'amount' ? newValue : txn.amount);
    fd.set("type", txn.type);
    fd.set("category", txn.category);
    fd.set("date", txn.date);

    try {
      await updateTransaction(fd);
      router.refresh();
      haptic.success();
    } catch (error) {
      setLocalTransactions(snapshot);
      showToast("Failed to inline update. Please try again.");
    }
  }, [localTransactions, router, haptic, showToast]);

  const activeEditCategories = editingTxn?.type === "income" ? capitalCats : expenseCats;

  // ── Confirm Delete Modal (Portal) ────────────────────────────────────────
  const renderConfirmModal = () => {
    if (!showConfirm) return null;
    return createPortal(
      // UX-01 FIX: role="dialog", aria-modal, aria-labelledby for screen readers.
      <div
        className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={(e) => { if (e.target === e.currentTarget) cancelDelete(); }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-desc"
          className="w-full bg-[#080b12]/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] sm:rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] max-w-lg mx-auto transform animate-in slide-in-from-bottom"
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer no-select" onClick={cancelDelete}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>

          <div className="px-6 py-4 sm:px-8 pb-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-2.25a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25v2.25m6.75 0h-13.5" />
                </svg>
              </div>
              <h3 id="confirm-modal-title" className="text-[16px] sm:text-lg font-black italic tracking-widest text-white uppercase leading-tight">System Override</h3>
              <p id="confirm-modal-desc" className="mt-2 text-[10px] sm:text-xs font-bold italic tracking-widest text-slate-400 uppercase leading-relaxed">
                Confirm permanent deletion?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                autoFocus
                onClick={cancelDelete}
                className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-4 sm:py-5 text-[10px] sm:text-[11px] font-black italic tracking-widest text-slate-400 uppercase transition-all hover:bg-white/10"
              >
                Abort
              </button>
              <button
                onClick={confirmDelete}
                className="click-pop flex-1 rounded-2xl bg-rose-600/20 border border-rose-500/50 py-4 sm:py-5 text-[10px] sm:text-[11px] font-black italic tracking-widest text-rose-400 uppercase transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:bg-rose-600/30"
              >
                Delete
              </button>
            </div>
            <div className="h-4 pb-safe-nav" />
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // ── Edit Modal (Portal) ──────────────────────────────────────────────────
  const renderEditModal = () => {
    if (!editingTxn) return null;
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
      >
        {/* UX-01 FIX: role="dialog", aria-modal, aria-labelledby */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
          className="w-full bg-[#080b12]/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] sm:rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] max-w-lg mx-auto transform animate-in slide-in-from-bottom max-h-[90dvh] flex flex-col pt-1"
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer no-select shrink-0" onClick={closeEdit}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>

          <div className="px-6 py-2 sm:px-8 overflow-y-auto w-full">
            {/* Sticky Header */}
            <div className="mb-5 flex items-center gap-3 sm:gap-4 sticky top-0 bg-[#080b12]/95 pt-2 pb-4 z-10 border-b border-white/5">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </div>
              <div>
                <h3 id="edit-modal-title" className="text-[12px] sm:text-[14px] font-black italic tracking-widest text-white uppercase">Edit Record</h3>
                <p className="text-[8px] sm:text-[9px] font-bold italic text-slate-400 uppercase tracking-widest mt-0.5">Update Data Values</p>
              </div>
              <button onClick={closeEdit} className="ml-auto text-slate-500 hover:text-white transition-colors p-2 -mr-2 text-xl font-bold bg-white/5 rounded-full w-8 h-8 flex items-center justify-center">×</button>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-type" className="text-[8px] sm:text-[9px] font-black italic tracking-widest text-slate-500 uppercase ml-1">Type</label>
                  <select
                    id="edit-type"
                    name="type"
                    value={editingTxn.type}
                    onChange={(e) => setEditingTxn({ ...editingTxn, type: e.target.value })}
                    // UX-02 FIX: text-[16px] on mobile prevents iOS Safari auto-zoom
                    className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-[16px] sm:text-xs font-bold italic text-white outline-none focus:border-sky-500/50 uppercase"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-date" className="text-[8px] sm:text-[9px] font-black italic tracking-widest text-slate-500 uppercase ml-1">Date</label>
                  <input
                    id="edit-date"
                    type="date"
                    name="date"
                    defaultValue={editingTxn.date}
                    required
                    // UX-02 FIX: text-[16px] on mobile prevents iOS Safari auto-zoom
                    className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-[16px] sm:text-xs font-bold italic text-white outline-none focus:border-sky-500/50 [color-scheme:dark] uppercase"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-amount" className="text-[8px] sm:text-[9px] font-black italic tracking-widest text-slate-500 uppercase ml-1">Amount (Rs.)</label>
                <input
                  id="edit-amount"
                  autoFocus
                  type="number"
                  step="0.01"
                  name="amount"
                  defaultValue={editingTxn.amount}
                  required
                  // UX-02 FIX: text-[16px] on mobile prevents iOS Safari auto-zoom
                  className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-[16px] sm:text-lg font-black italic text-white outline-none focus:border-sky-500/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-category" className="text-[8px] sm:text-[9px] font-black italic tracking-widest text-slate-500 uppercase ml-1">Category</label>
                <select
                  id="edit-category"
                  name="category"
                  defaultValue={editingTxn.category}
                  // UX-02 FIX: text-[16px] on mobile prevents iOS Safari auto-zoom
                  className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-[16px] sm:text-xs font-bold italic text-white outline-none focus:border-sky-500/50 uppercase appearance-none"
                >
                  {activeEditCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#161b27]">
                      {CATEGORY_EMOJI[cat] ?? "📦"} {cat}
                    </option>
                  ))}
                  {!activeEditCategories.includes(editingTxn.category) && (
                    <option key={editingTxn.category} value={editingTxn.category} className="bg-[#161b27]">
                      📦 {editingTxn.category}
                    </option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-description" className="text-[8px] sm:text-[9px] font-black italic tracking-widest text-slate-500 uppercase ml-1">Description</label>
                <input
                  id="edit-description"
                  type="text"
                  name="description"
                  defaultValue={editingTxn.description}
                  required
                  // UX-02 FIX: text-[16px] on mobile prevents iOS Safari auto-zoom
                  className="rounded-xl border border-white/5 bg-black/40 p-3.5 text-[16px] sm:text-xs font-bold italic text-white outline-none focus:border-sky-500/50 uppercase"
                />
              </div>

              {/* Sticky footer */}
              <div className="flex gap-3 mt-4 border-t border-white/5 pb-8 pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="click-pop flex-1 rounded-2xl bg-sky-600/20 border border-sky-500/50 py-4 text-[10px] sm:text-[11px] font-black italic tracking-widest text-sky-400 uppercase transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:bg-sky-500/30 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
              <div className="h-4 pb-safe-nav -mt-4" />
            </form>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <section className="flex flex-col gap-6 relative w-full">

      {/* Portals */}
      {mounted && renderConfirmModal()}
      {mounted && renderEditModal()}

      {/* UX-07 FIX: Premium toast replaces native alert() for error feedback */}
      {toastMsg && (
        <div className="fixed bottom-28 left-4 right-4 z-[99999] flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-[#161b27]/95 px-5 py-4 shadow-[0_0_30px_rgba(244,63,94,0.2)] backdrop-blur-xl toast-animate">
          <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
          <p className="text-[10px] font-bold italic tracking-widest text-rose-400 uppercase">{toastMsg}</p>
          <button onClick={() => setToastMsg(null)} className="ml-auto text-slate-500 hover:text-white transition-colors shrink-0" aria-label="Dismiss">✕</button>
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
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[8px] sm:text-[10px] font-bold italic tracking-widest text-slate-500 uppercase">
                {filtered.length} Records Synced
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 w-full">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="QUERY LOG..."
            aria-label="Search transactions"
            // UX-02 FIX: text-[16px] prevents iOS auto-zoom
            className="w-full sm:w-64 rounded-2xl border border-white/5 bg-[#161b27]/30 backdrop-blur-md px-5 py-3 text-[16px] sm:text-xs font-bold italic text-white outline-none focus:border-sky-500/50 uppercase placeholder:text-slate-500 transition-all focus:bg-white/5 shadow-inner"
          />
          
          {/* Smart Filter Chips */}
          <div className="flex gap-2 w-full overflow-x-auto pb-1 scrollbar-none snap-x relative z-10" aria-label="Filter transactions">
            {filterOptions.map((f) => {
              const isActive = filter === f;
              const isCat = f !== "all" && f !== "income" && f !== "expense";
              const label = isCat ? `${CATEGORY_EMOJI[f] || ""} ${f}` : f;
              
              return (
                <button
                  key={f}
                  onClick={() => { haptic.light(); setFilter(f); }}
                  aria-pressed={isActive}
                  className={`snap-start shrink-0 rounded-full px-4 py-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                    isActive
                      ? "bg-sky-500/20 text-sky-400 border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                      : "bg-[#161b27]/40 text-slate-400 border-white/5 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Transaction List ── */}
      <div className="rounded-[24px] sm:rounded-[40px] border border-white/5 scroll-glass p-3 sm:p-5 flex flex-col gap-2 w-full">
        {filtered.map((txn, idx) => {
          const currentOffset = swipeOffsets[txn.id] || 0;
          const isSwipedOpen = swipedId === txn.id;
          const isEven = idx % 2 === 0;

          return (
            <div
              key={txn.id}
              ref={(el) => {
                if (el && observerRef.current) observerRef.current.observe(el);
              }}
              className="relative overflow-hidden rounded-2xl border border-transparent bg-transparent hover:border-white/10 swipe-row-container opacity-0 translate-y-4 transition-all duration-500 ease-out"
              style={{ transitionDelay: `${(idx % 10) * 30}ms` }}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
                rowStartPositions.current[txn.id] = e.clientX;
              }}
              onPointerMove={(e) => {
                if (rowStartPositions.current[txn.id] == null) return;
                const dx = e.clientX - rowStartPositions.current[txn.id];

                if (dx < 0 && !isSwipedOpen) {
                  setSwipeOffsets((prev) => ({ ...prev, [txn.id]: Math.max(dx, -90) }));
                } else if (dx > 0 && isSwipedOpen) {
                  setSwipeOffsets((prev) => ({ ...prev, [txn.id]: Math.min(-90 + dx, 0) }));
                }
              }}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId);
                const offset = swipeOffsets[txn.id] || 0;

                if (offset < -60) {
                  haptic.medium();
                  setSwipedId(txn.id);
                  setSwipeOffsets((prev) => ({ ...prev, [txn.id]: -90 }));
                } else {
                  setSwipedId(null);
                  setSwipeOffsets((prev) => ({ ...prev, [txn.id]: 0 }));
                }
                rowStartPositions.current[txn.id] = null;
              }}
              onPointerCancel={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId);
                if (!isSwipedOpen) {
                  setSwipeOffsets((prev) => ({ ...prev, [txn.id]: 0 }));
                }
                rowStartPositions.current[txn.id] = null;
              }}
            >
              {/* Delete Zone */}
              <div
                className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center bg-rose-500/20 border-l border-rose-500/30"
                style={{ opacity: isSwipedOpen ? 1 : Math.abs(currentOffset) / 100 }}
                aria-hidden="true"
              >
                <button
                  tabIndex={isSwipedOpen ? 0 : -1}
                  onClick={(e) => askDelete(txn.id, e.currentTarget)}
                  aria-label={`Delete transaction: ${txn.description}`}
                  className="w-full h-full flex flex-col items-center justify-center text-rose-400 gap-1 active:bg-rose-500/20 transition-colors duration-150"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-2.25a2.25 2.25 0 00-2.25-2.25h-4.5a2.25 2.25 0 00-2.25 2.25v2.25m6.75 0h-13.5" />
                  </svg>
                  <span className="text-[9px] font-black italic tracking-widest uppercase">Delete</span>
                </button>
              </div>

              {/* Sliding Content Row */}
              <div
                className={`flex items-center justify-between p-3 sm:p-4 cursor-grab active:cursor-grabbing swipe-row-content transition-colors ${isEven ? 'bg-[#161b27]/40' : 'bg-[#161b27]/80'}`}
                style={{
                  transform: `translateX(${isSwipedOpen ? -90 : currentOffset}px)`,
                  transition: rowStartPositions.current[txn.id] != null
                    ? "none"
                    : "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                <div
                  className="flex items-center gap-3 sm:gap-4 overflow-hidden"
                  onClick={() => { if (!isSwipedOpen) openEdit(txn); }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Edit transaction: ${txn.description}`}
                  onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !isSwipedOpen) openEdit(txn, e.currentTarget); }}
                >
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-lg sm:text-xl border transition-all duration-300 ${CATEGORY_THEME[txn.category] || (txn.type === "income" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]")}`}>
                    {CATEGORY_EMOJI[txn.category] ?? "📦"}
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    {inlineEditDesc === txn.id ? (
                      <input
                        autoFocus
                        defaultValue={txn.description}
                        onBlur={(e) => handleInlineUpdate(txn, 'description', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.target.blur();
                          if (e.key === 'Escape') setInlineEditDesc(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs sm:text-sm font-semibold tracking-normal text-slate-100 bg-[#080b12]/90 border border-sky-500/50 rounded-md px-2 py-0.5 outline-none w-full sm:w-[200px] shadow-[0_0_10px_rgba(56,189,248,0.2)] uppercase"
                      />
                    ) : (
                      <p 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isSwipedOpen) { haptic.light(); setInlineEditDesc(txn.id); }
                        }}
                        className="text-xs sm:text-sm font-semibold tracking-normal text-slate-100 capitalize truncate transition-colors hover:text-sky-400 cursor-text -ml-2 px-2 py-0.5 rounded-md hover:bg-white/5"
                      >
                        {txn.description.toLowerCase()}
                      </p>
                    )}
                    <p className="text-[9px] sm:text-[10px] font-bold italic tracking-widest text-slate-500 uppercase truncate mt-0.5 ml-2 sm:ml-0">
                      {txn.category} <span className="mx-1 opacity-40">•</span> {fmtDate(txn.date)}
                    </p>
                  </div>
                </div>
                
                <div className={`text-right text-sm sm:text-base font-bold tracking-tight shrink-0 ml-4 ${txn.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                  {inlineEditAmount === txn.id ? (
                    <input
                      autoFocus
                      type="number"
                      step="0.01"
                      defaultValue={txn.amount}
                      onBlur={(e) => handleInlineUpdate(txn, 'amount', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.target.blur();
                        if (e.key === 'Escape') setInlineEditAmount(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm sm:text-base font-bold tracking-tight bg-[#080b12]/90 border border-sky-500/50 rounded-md px-2 py-0.5 outline-none w-24 sm:w-28 text-right shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                    />
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSwipedOpen) { haptic.light(); setInlineEditAmount(txn.id); }
                      }}
                      className="transition-colors hover:text-sky-400 cursor-text -mr-2 px-2 py-0.5 rounded-md hover:bg-white/5 truncate"
                    >
                      {txn.type === "income" ? "+ " : "- "}{fmt(txn.amount)}
                    </div>
                  )}
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

    </section>
  );
}