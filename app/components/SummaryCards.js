"use client"; // 🚀 AnimatedNumber නිසා මේක Client Component එකක් වෙනවා
import React, { useState, useEffect } from 'react';

// 🚀 UI Upgrade: 0 ඉඳන් සල්ලි ගාණ උඩට යන ඇනිමේෂන් එක
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1200; // කොච්චර වෙලාවක් කැරකෙන්න ඕනෙද (ms)

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // easeOutExpo effect - වේගෙන් පටන් අරන් අගදි හිමීට නතර වෙනවා
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(easeProgress * value);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayValue);
};

// ── ELITE MINIMALIST ICONS ──
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

export default function SummaryCards({ totalIncome, totalExpenses, balance, transactions = [], currentUser = "", selectedMonth = "ALL" }) {

  let incStr = "";
  let expStr = "";
  let incChange = 0;
  let expChange = 0;

  if (selectedMonth === "ALL") {
    incStr = "LIFETIME TOTAL";
    expStr = "LIFETIME TOTAL";
  } else {
    const [y, m] = selectedMonth.split('-');
    let prevDate = new Date(parseInt(y), parseInt(m) - 2, 1);
    const prevY = prevDate.getFullYear();
    const prevM = String(prevDate.getMonth() + 1).padStart(2, "0");
    const prevMonthStr = `${prevY}-${prevM}`;

    const prevT = transactions.filter(t => t.date?.startsWith(prevMonthStr) && t.user?.toUpperCase() === currentUser.toUpperCase());
    const prevInc = prevT.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExp = prevT.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    incChange = prevInc === 0 ? (totalIncome > 0 ? 100 : 0) : ((totalIncome - prevInc) / prevInc) * 100;
    expChange = prevExp === 0 ? (totalExpenses > 0 ? 100 : 0) : ((totalExpenses - prevExp) / prevExp) * 100;

    incStr = `${Math.abs(incChange).toFixed(1)}% VS PREV`;
    expStr = `${Math.abs(expChange).toFixed(1)}% VS PREV`;
  }

  const cards = [
    {
      id: "card-total-income",
      label: "CASH IN",
      value: totalIncome,
      change: incStr,
      arrow: selectedMonth === "ALL" ? "●" : (incChange >= 0 ? "▲" : "▼"),
      isGood: selectedMonth === "ALL" ? true : (incChange >= 0),
      color: "emerald",
      icon: <IconIn />,
      delay: "0.1s" // 🚀 Staggered delay
    },
    {
      id: "card-total-expenses",
      label: "CASH OUT",
      value: totalExpenses,
      change: expStr,
      arrow: selectedMonth === "ALL" ? "●" : (expChange >= 0 ? "▲" : "▼"),
      isGood: selectedMonth === "ALL" ? false : (expChange <= 0),
      color: "rose",
      icon: <IconOut />,
      delay: "0.2s" // 🚀 Staggered delay
    },
    {
      id: "card-current-balance",
      label: selectedMonth === "ALL" ? "NET BALANCE" : "MONTH NET",
      value: balance,
      change: balance > 0 ? "HEALTHY SURPLUS" : balance < 0 ? "IN DEFICIT" : "ZERO BALANCE",
      arrow: balance >= 0 ? "▲" : "▼",
      isGood: balance >= 0,
      color: "sky",
      icon: <IconBalance />,
      delay: "0.3s" // 🚀 Staggered delay
    },
  ];

  return (
    <section className="grid grid-cols-3 gap-2 sm:gap-6">
      {cards.map((card) => (
        <article
          key={card.id}
          // 🚀 UI Upgrade: Staggered animation (animate-vibe)
          className={`animate-vibe click-pop group relative overflow-hidden rounded-[24px] sm:rounded-[40px] border border-white/5 premium-glass p-3 sm:p-5 transition-all duration-500 hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[110px] sm:min-h-[140px]
            ${card.color === 'emerald' ? 'hover:border-emerald-500/30 hover:shadow-[0_15px_40px_-15px_rgba(52,211,153,0.3)]' :
              card.color === 'rose' ? 'hover:border-rose-500/30 hover:shadow-[0_15px_40px_-15px_rgba(244,63,94,0.3)]' :
                'hover:border-sky-500/30 hover:shadow-[0_15px_40px_-15px_rgba(56,189,248,0.3)]'}`}
          style={{ animationDelay: card.delay }}
        >
          <div className={`absolute -right-5 -top-5 sm:-right-10 sm:-top-10 h-16 w-16 sm:h-32 sm:w-32 rounded-full blur-[30px] sm:blur-[50px] transition-opacity duration-500 opacity-10 group-hover:opacity-30 pointer-events-none
            ${card.color === 'emerald' ? 'bg-emerald-500' : card.color === 'rose' ? 'bg-rose-500' : 'bg-sky-500'}`}
          />

          <div className="relative z-10 flex flex-col h-full justify-between gap-3 sm:gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[7px] sm:text-[10px] font-black italic tracking-widest text-slate-400 uppercase truncate mr-1">
                {card.label}
              </p>

              <div className={`flex shrink-0 items-center justify-center transition-all duration-500 group-hover:scale-110 w-5 h-5 sm:w-8 sm:h-8 rounded-md sm:rounded-xl border
                ${card.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.4)]' :
                  card.color === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]' :
                    'bg-sky-500/10 border-sky-500/20 text-sky-400 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]'}`}
              >
                <div className="w-3 h-3 sm:w-4 sm:h-4">
                  {card.icon}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 sm:gap-1.5">
              {/* 🚀 UI Upgrade: Animated Number පාවිච්චි කරනවා */}
              <h3 className={`text-[11px] sm:text-2xl font-black italic tracking-tighter leading-none truncate bg-clip-text text-transparent
                ${card.color === 'emerald' ? 'bg-gradient-to-br from-emerald-300 to-emerald-500' :
                  card.color === 'rose' ? 'bg-gradient-to-br from-rose-300 to-rose-500' :
                    'bg-gradient-to-br from-sky-300 to-sky-500'}`}
              >
                Rs. <AnimatedNumber value={card.value} />
              </h3>

              <div className="flex items-center mt-1 sm:mt-0">
                <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[6px] sm:text-[9px] font-bold italic border transition-all duration-500 w-full sm:w-auto overflow-hidden
                  ${card.isGood ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40' :
                    'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20 group-hover:border-rose-500/40'}`}
                >
                  <span className="shrink-0">{card.arrow}</span>
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