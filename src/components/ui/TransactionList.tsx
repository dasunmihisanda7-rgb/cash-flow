"use client";

import { Transaction } from "@/app/page";
import { Paperclip } from "lucide-react";

type Props = {
  transactions: Transaction[];
  onDelete: (id: string) => void;
};

export default function TransactionList({ transactions, onDelete }: Props) {
  const formatter = new Intl.NumberFormat("en-LK", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formatCurrency = (val: number) => `Rs. ${formatter.format(val)}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col">
      <h2 className="text-xl font-black italic uppercase tracking-wider">RECENT TRANSACTIONS</h2>
      
      {transactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 mt-8 mb-8">
          <p>NO TRANSACTIONS FOUND.</p>
          <p className="text-sm mt-1 uppercase">ADD YOUR FIRST INCOME OR EXPENSE!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto pr-2 h-[450px]">
          {transactions.map((t) => (
            <div 
              key={t.id} 
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800/50 hover:border-slate-700 transition-all shadow-sm relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              
              <div className="flex items-center gap-4 pl-2 mb-2 sm:mb-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {t.type === 'income' ? '+' : '-'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 italic uppercase">{t.category.toUpperCase()}</h4>
                  <p className="text-xs text-slate-500 uppercase flex items-center gap-2">
                    {t.date} {t.description && `• ${t.description.toUpperCase()}`}
                    {t.invoiceFile && (
                      <span title={t.invoiceFile.name} className="flex items-center gap-1 text-[10px] text-slate-400 border border-slate-800 rounded px-1.5 py-0.5 bg-slate-900/50">
                        <Paperclip size={10} />
                        DOCUMENT
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center pl-16 sm:pl-0">
                <span 
                  className={`font-semibold tracking-tight italic ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}
                  style={{ fontStyle: "italic" }}
                >
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <button 
                  onClick={() => onDelete(t.id)}
                  className="text-xs font-medium text-slate-500 hover:text-rose-400 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 mt-1 uppercase"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
