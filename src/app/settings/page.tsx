"use client";

import { useState } from "react";
import { Plus, Trash2, Filter } from "lucide-react";

import { useCategories } from "@/context/CategoryContext";

export default function SettingsPage() {
  const { incomeCategories, expenseCategories, addCategory, removeCategory } = useCategories();
  const [newIncomeCat, setNewIncomeCat] = useState("");
  const [newExpenseCat, setNewExpenseCat] = useState("");

  const handleAdd = (type: 'income' | 'expense') => {
    if (type === 'income' && newIncomeCat.trim()) {
      addCategory('income', newIncomeCat);
      setNewIncomeCat("");
    } else if (type === 'expense' && newExpenseCat.trim()) {
      addCategory('expense', newExpenseCat);
      setNewExpenseCat("");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
      {/* Income Categories Section */}
      <div className="bg-[rgb(7,10,18)] border border-slate-800 rounded-[35px] p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-black italic text-white uppercase tracking-[1.5px] flex items-center gap-2">
            <Plus size={24} className="text-emerald-500" strokeWidth={3} />
            Income Categories
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={newIncomeCat}
            onChange={(e) => setNewIncomeCat(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd('income')}
            className="w-full bg-[rgb(5,7,13)] border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-3xl px-[24px] py-6 text-white font-bold outline-none transition-all placeholder-slate-700"
            placeholder="NEW INCOME CATEGORY..."
          />
          <button
            onClick={() => handleAdd('income')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase italic text-sm tracking-widest shadow-lg shadow-emerald-500/10"
          >
            <Plus size={18} />
            SAVE CATEGORY
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          {incomeCategories.map(cat => (
            <div key={cat} className="group flex items-center justify-between bg-white/[0.08] backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl hover:bg-white/[0.12] hover:border-white/30 transition-all shadow-lg">
              <span className="text-white font-bold italic uppercase tracking-wider">{cat}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeCategory('income', cat);
                }}
                className="text-slate-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 p-2 -mr-2 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-transparent hover:border-rose-500/30"
                title="DELETE CATEGORY"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Categories Section */}
      <div className="bg-[rgb(7,10,18)] border border-slate-800 rounded-[35px] p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-black italic text-white uppercase tracking-[1.5px] flex items-center gap-2">
            <Filter size={24} className="text-rose-500" strokeWidth={3} />
            Expense Categories
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={newExpenseCat}
            onChange={(e) => setNewExpenseCat(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd('expense')}
            className="w-full bg-[rgb(5,7,13)] border border-slate-800 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 rounded-3xl px-[24px] py-6 text-white font-bold outline-none transition-all placeholder-slate-700"
            placeholder="NEW EXPENSE CATEGORY..."
          />
          <button
            onClick={() => handleAdd('expense')}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase italic text-sm tracking-widest shadow-lg shadow-rose-500/10"
          >
            <Plus size={18} />
            SAVE CATEGORY
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          {expenseCategories.map(cat => (
            <div key={cat} className="group flex items-center justify-between bg-white/[0.08] backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl hover:bg-white/[0.12] hover:border-white/30 transition-all shadow-lg">
              <span className="text-white font-bold italic uppercase tracking-wider">{cat}</span>
              <button 
                onClick={() => removeCategory('expense', cat)}
                className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

