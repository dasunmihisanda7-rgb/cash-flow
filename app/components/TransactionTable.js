"use client";
import { useState, useEffect } from "react"; // ⬅️ useEffect එකතු කළා
import { deleteTransaction } from "@/app/actions";
import { useRouter } from "next/navigation";

const CATEGORY_EMOJI = {
  Salary: "💼", Freelance: "🖊️", Investments: "📈",
  Food: "🍔", Transport: "🚌", Utilities: "⚡",
  Health: "🏥", Entertainment: "🎬", Education: "📚", Other: "📦",
};

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

  // ── LOCAL STATE ──
  // සර්වර් එකෙන් එන දත්ත වල කොපියක් මේ state එකේ තියාගන්නවා
  const [localTransactions, setLocalTransactions] = useState(transactions);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // මාසය මාරු කළොත් හෝ අලුත් දත්ත Prop එකෙන් ආවොත් Local State එක Update කරන්න
  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  // filtered variable එක දැන් වැඩ කරන්නේ localTransactions එක්කයි
  const filtered = localTransactions.filter((t) => {
    const matchType = filter === "all" || t.type === filter;
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const askDelete = (id) => {
    setIdToDelete(id);
    setShowConfirm(true);
  };

  async function confirmDelete() {
    if (!idToDelete) return;

    const targetId = idToDelete;
    setDeletingId(targetId);
    setShowConfirm(false);

    // 🔥 පියවර 1: UI එකෙන් ක්ෂණිකව මකන්න (Optimistic Update)
    // සර්වර් එකෙන් එනකම් ඉන්නේ නැතුව දැන්ම පේළිය අයින් කරනවා
    setLocalTransactions(prev => prev.filter(t => t.id !== targetId));

    const fd = new FormData();
    fd.set("id", targetId);

    try {
      await deleteTransaction(fd);
      // 🔥 පියවර 2: බැක්ග්‍රවුන්ඩ් එකේ සර්වර් එක Sync කරන්න
      router.refresh();
    } catch (error) {
      alert("Error deleting: " + error.message);
      // මොකක් හරි වැරැද්දක් වුණොත් ආපහු තිබුණු දත්ත ටික පෙන්වන්න (Rollback)
      setLocalTransactions(transactions);
    } finally {
      setDeletingId(null);
      setIdToDelete(null);
    }
  }

  return (
    <section className="flex flex-col gap-6 relative">

      {/* ── CUSTOM CONFIRMATION MODAL ── */}
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
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-3.5 text-[10px] font-black italic tracking-widest text-slate-400 uppercase transition-all"
              >
                Abort
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-2xl bg-rose-600/20 border border-rose-500/50 py-3.5 text-[10px] font-black italic tracking-widest text-rose-400 uppercase transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header & Controls ── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-black italic tracking-[0.3em] text-white uppercase">System Log</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] font-bold italic tracking-widest text-slate-500 uppercase">
                {filtered.length} Records Synced
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="QUERY LOG..."
            className="w-full sm:w-56 rounded-2xl border border-white/5 bg-[#161b27]/30 backdrop-blur-md px-5 py-2.5 text-[11px] font-bold italic text-white outline-none focus:border-sky-500/50 uppercase"
          />

          <div className="flex gap-2 bg-[#161b27]/30 backdrop-blur-md p-1 rounded-2xl border border-white/5">
            {["all", "income", "expense"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-4 py-2 text-[10px] font-black italic tracking-widest uppercase transition-all ${filter === f ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-[40px] border border-white/5 bg-[#161b27]/30 backdrop-blur-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/20 text-[10px] font-black italic tracking-[0.3em] text-slate-500 uppercase">
                <th className="px-8 py-5">Entity</th>
                <th className="px-8 py-5 text-right">Value</th>
                <th className="px-8 py-5 text-center">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((txn) => (
                <tr key={txn.id} className="group transition-all hover:bg-white/[0.02]">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg border ${txn.type === "income" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                        {CATEGORY_EMOJI[txn.category] ?? "📦"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-slate-200 uppercase truncate max-w-[100px] sm:max-w-none">{txn.description}</p>
                        <p className="text-[9px] font-bold italic text-slate-500 sm:hidden uppercase">{txn.category} • {fmtDate(txn.date)}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-8 py-5 text-right text-[16px] font-black italic ${txn.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                    {txn.type === "income" ? "+ " : "- "} {fmt(txn.amount)}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button
                      disabled={deletingId === txn.id}
                      onClick={() => askDelete(txn.id)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white/5 text-slate-500 hover:text-rose-400 transition-all"
                    >
                      {deletingId === txn.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent"></div>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
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