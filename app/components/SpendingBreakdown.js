"use client";
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// ── 1. CATEGORY CONFIGURATION ─────────────────────
const CATEGORY_COLORS = {
  Salary: "#22c55e", Freelance: "#10b981", Investments: "#34d399", Business: "#059669", Bonus: "#15803d",
  Food: "#f43f5e", Transport: "#fb923c", Utilities: "#facc15",
  Health: "#a78bfa", Entertainment: "#38bdf8", Education: "#818cf8", Other: "#94a3b8",
};

const fmt = (n) =>
  `Rs. ${new Intl.NumberFormat("en-LK", { minimumFractionDigits: 0 }).format(n)}`;

// ── 2. CUSTOM TOOLTIP DESIGN ─────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const categoryColor = CATEGORY_COLORS[data.name] || "#ffffff";

    return (
      <div className="pointer-events-none flex flex-col justify-center rounded-xl sm:rounded-2xl border border-white/10 bg-[#0f172a]/95 px-3 py-2 sm:px-4 sm:py-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl outline-none">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full"
            style={{ backgroundColor: categoryColor, boxShadow: `0 0 10px ${categoryColor}` }}
          />
          <p className="text-[8px] sm:text-[10px] font-black italic text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            {data.name}
          </p>
        </div>
        <p className="text-[12px] sm:text-[14px] font-black text-white italic tracking-widest pl-3 sm:pl-4">
          {fmt(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function SpendingBreakdown({ transactions }) {

  const processData = (type) => {
    const filtered = transactions.filter(t => t.type === type);
    const stats = filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const expenseData = processData('expense');
  const incomeData = processData('income');

  const totalExp = expenseData.reduce((s, d) => s + d.value, 0);
  const totalInc = incomeData.reduce((s, d) => s + d.value, 0);

  // 🚀 අලුත්: Gradient සහ 3D Shadow හදන කෑල්ල
  const renderDefs = () => (
    <defs>
      {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
        <linearGradient id={`color-${key}`} x1="0" y1="0" x2="1" y2="1" key={key}>
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.4} />
        </linearGradient>
      ))}
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.5" />
      </filter>
    </defs>
  );

  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-8">

      {/* ── EXPENSE BREAKDOWN (CASH OUT) ── */}
      <div className="group relative overflow-hidden rounded-[24px] sm:rounded-[32px] border border-white/5 bg-[#161b27]/30 p-4 sm:p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-500 hover:border-rose-500/30 hover:bg-white/[0.02] flex flex-col">

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-8 gap-2 sm:gap-0">
          <div className="flex items-center gap-1.5 sm:gap-3 mt-1">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)] animate-pulse" />
            <h2 className="text-[8px] sm:text-[12px] font-black italic tracking-widest sm:tracking-[0.3em] text-white uppercase truncate">Cash Out Analytics</h2>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[6px] sm:text-[9px] font-bold text-slate-500 italic uppercase tracking-widest hidden sm:block">Total Outflow</p>
            <p className="text-[12px] sm:text-lg font-black text-rose-500 italic mt-0.5 truncate">{fmt(totalExp)}</p>
          </div>
        </div>

        <div className="relative h-[120px] sm:h-[250px] w-full mb-4 sm:mb-6 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {renderDefs()}
              <Pie
                data={expenseData}
                innerRadius="65%" // 🚀 මහත වෙනස් කළා
                outerRadius="90%"
                paddingAngle={8}  // 🚀 පරතරය වැඩි කළා
                cornerRadius={10} // 🚀 වටකුරු දාර දැම්මා
                dataKey="value"
                stroke="#161b27"  // 🚀 Background එකේ පාටින්ම border එකක් දැම්මා
                strokeWidth={3}
                animationBegin={0}
                animationDuration={1500}
                filter="url(#shadow)" // 🚀 Shadow එක ඇඩ් කළා
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#color-${entry.name})`} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} wrapperStyle={{ outline: 'none', zIndex: 100 }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[6px] sm:text-[9px] font-bold text-slate-600 italic tracking-[0.2em] sm:tracking-[0.4em] uppercase">Overview</p>
            <p className="text-[10px] sm:text-lg font-black text-rose-500/80 italic tracking-widest mt-0.5 sm:mt-1">OUTFLOW</p>
          </div>
        </div>

        {expenseData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-white/5 mt-auto">
            {expenseData.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-black/20 border border-white/5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] || "#e11d48", boxShadow: `0 0 8px ${CATEGORY_COLORS[item.name]}` }} />
                  <span className="text-[7px] sm:text-[10px] font-bold text-slate-400 italic uppercase tracking-wider truncate max-w-[40px] sm:max-w-[60px]" title={item.name}>{item.name}</span>
                </div>
                <span className="text-[7px] sm:text-[10px] font-black text-white italic">{((item.value / totalExp) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-4 sm:pt-6 border-t border-white/5 text-center mt-auto">
            <p className="text-[7px] sm:text-[10px] font-bold italic tracking-widest text-slate-600 uppercase">NO OUTFLOW DATA</p>
          </div>
        )}
      </div>

      {/* ── INCOME SOURCES (CASH IN) ── */}
      <div className="group relative overflow-hidden rounded-[24px] sm:rounded-[32px] border border-white/5 bg-[#161b27]/30 p-4 sm:p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-500 hover:border-emerald-500/30 hover:bg-white/[0.02] flex flex-col">

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between mb-4 sm:mb-8 gap-2 sm:gap-0">
          <div className="flex items-center gap-1.5 sm:gap-3 mt-1">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] animate-pulse" />
            <h2 className="text-[8px] sm:text-[12px] font-black italic tracking-widest sm:tracking-[0.3em] text-white uppercase truncate">Cash In Analytics</h2>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[6px] sm:text-[9px] font-bold text-slate-500 italic uppercase tracking-widest hidden sm:block">Total Inflow</p>
            <p className="text-[12px] sm:text-lg font-black text-emerald-500 italic mt-0.5 truncate">{fmt(totalInc)}</p>
          </div>
        </div>

        <div className="relative h-[120px] sm:h-[250px] w-full mb-4 sm:mb-6 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {renderDefs()}
              <Pie
                data={incomeData}
                innerRadius="65%"
                outerRadius="90%"
                paddingAngle={8}
                cornerRadius={10}
                dataKey="value"
                stroke="#161b27"
                strokeWidth={3}
                animationBegin={300}
                animationDuration={1500}
                filter="url(#shadow)"
              >
                {incomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#color-${entry.name})`} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} wrapperStyle={{ outline: 'none', zIndex: 100 }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[6px] sm:text-[9px] font-bold text-slate-600 italic tracking-[0.2em] sm:tracking-[0.4em] uppercase">Sources</p>
            <p className="text-[10px] sm:text-lg font-black text-emerald-500/80 italic tracking-widest mt-0.5 sm:mt-1">INFLOW</p>
          </div>
        </div>

        {incomeData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-white/5 mt-auto">
            {incomeData.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-black/20 border border-white/5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] || "#10b981", boxShadow: `0 0 8px ${CATEGORY_COLORS[item.name]}` }} />
                  <span className="text-[7px] sm:text-[10px] font-bold text-slate-400 italic uppercase tracking-wider truncate max-w-[40px] sm:max-w-[60px]" title={item.name}>{item.name}</span>
                </div>
                <span className="text-[7px] sm:text-[10px] font-black text-white italic">{((item.value / totalInc) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-4 sm:pt-6 border-t border-white/5 text-center mt-auto">
            <p className="text-[7px] sm:text-[10px] font-bold italic tracking-widest text-slate-600 uppercase">NO INFLOW DATA</p>
          </div>
        )}
      </div>

    </section>
  );
}