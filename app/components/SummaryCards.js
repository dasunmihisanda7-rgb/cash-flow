// app/components/SummaryCards.js – Server Component
import React from 'react';

// ── 1. ELITE MINIMALIST ICONS (Responsive size) ─────────────────────

const IconIn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307L21.75 6.75m0 0H16.5m5.25 0v5.25" />
  </svg>
);

const IconOut = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307L21.75 17.25m0 0H16.5m5.25 0v-5.25" />
  </svg>
);

const IconBalance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);

export default function SummaryCards({ totalIncome, totalExpenses, balance }) {
  const fmt = (n) =>
    `Rs. ${new Intl.NumberFormat("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)}`;

  const cards = [
    {
      id: "card-total-income",
      label: "CASH IN",
      value: fmt(totalIncome),
      change: "+12.4% vs last month",
      positive: true,
      color: "emerald",
      icon: <IconIn />,
    },
    {
      id: "card-total-expenses",
      label: "CASH OUT",
      value: fmt(totalExpenses),
      change: "-3.1% vs last month",
      positive: false,
      color: "rose",
      icon: <IconOut />,
    },
    {
      id: "card-current-balance",
      label: "BALANCE", // Text එක ටිකක් කොට කළා පෝන් එකට ලේසි වෙන්න
      value: fmt(balance),
      change: balance >= 0 ? "Healthy surplus" : "In deficit",
      positive: balance >= 0,
      color: "sky",
      icon: <IconBalance />,
    },
  ];

  return (
    // 🔥 වෙනස් කරපු කොටස: පෝන් එකේදීත් grid-cols-3 කරලා එක පේළියට ගත්තා
    <section className="grid grid-cols-3 gap-2 sm:gap-6">
      {cards.map((card) => (
        <article
          key={card.id}
          // පෝන් එකට padding (p-3) සහ border-radius (rounded-[24px]) අඩු කළා
          className="group relative overflow-hidden rounded-[24px] sm:rounded-[50px] border border-white/5 bg-[#161b27]/30 p-3 sm:p-6 backdrop-blur-2xl transition-all duration-500 hover:bg-white/[0.03] hover:border-white/10 hover:-translate-y-1 cursor-pointer shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[110px] sm:min-h-auto"
        >
          {/* Enhanced Glow Effect on Hover */}
          <div className={`absolute -right-5 -top-5 sm:-right-10 sm:-top-10 h-16 w-16 sm:h-32 sm:w-32 rounded-full blur-[30px] sm:blur-[50px] transition-opacity duration-500 opacity-10 group-hover:opacity-30 
            ${card.color === 'emerald' ? 'bg-emerald-500' : card.color === 'rose' ? 'bg-rose-500' : 'bg-sky-500'}`}
          />

          <div className="relative z-10 flex flex-col h-full justify-between gap-3 sm:gap-6">

            {/* Top Row: Label & Icon */}
            <div className="flex items-start justify-between">
              <p className="text-[7px] sm:text-[11px] font-black italic tracking-widest text-slate-500 uppercase mt-0.5 sm:mt-1 truncate mr-1">
                {card.label}
              </p>
              <div className={`flex shrink-0 items-center justify-center transition-all duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100 w-4 h-4 sm:w-8 sm:h-8
                ${card.color === 'emerald' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
                  card.color === 'rose' ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]' : 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]'}`}
              >
                {card.icon}
              </div>
            </div>

            {/* Bottom Row: Amount & Badge */}
            <div className="flex flex-col gap-1 sm:gap-2">
              <h3 className={`text-[11px] sm:text-3xl font-black italic tracking-tighter leading-none truncate
                ${card.color === 'emerald' ? 'text-emerald-400' :
                  card.color === 'rose' ? 'text-rose-400' :
                    'text-sky-400'}`}
              >
                {card.value}
              </h3>

              <div className="flex items-center">
                <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[6px] sm:text-[10px] font-bold italic border transition-colors duration-500 w-full sm:w-auto overflow-hidden
                  ${card.positive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20' :
                    'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20'}`}
                >
                  <span className="shrink-0">{card.positive ? "▲" : "▼"}</span>
                  <span className="ml-0.5 sm:ml-1 tracking-wider uppercase truncate">{card.change}</span>
                </span>
              </div>
            </div>

          </div>
        </article>
      ))}
    </section>
  );
}