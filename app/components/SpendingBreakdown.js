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
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0b0d13]/95 p-4 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <p className="text-[9px] font-black italic text-slate-500 uppercase tracking-[0.3em] mb-1">
          {payload[0].name}
        </p>
        <p className="text-sm font-black text-white italic tracking-widest">
          {fmt(payload[0].value)}
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

  return (
    // Gap 12 ඉඳන් 8 ට අඩු කළා
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">

      {/* ── EXPENSE BREAKDOWN (CASH OUT) ── */}
      {/* Padding p-12 ඉඳන් p-8 ට අඩු කළා, Rounded 32px කළා */}
      <div className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-[#161b27]/30 p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-500 hover:border-rose-500/30 hover:bg-white/[0.02]">

        {/* Header Section */}
        <div className="relative z-10 flex items-start justify-between mb-8">
          <div className="flex items-center gap-3 mt-1">
            <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)] animate-pulse" />
            <h2 className="text-[12px] font-black italic tracking-[0.3em] text-white uppercase">Cash Out Analytics</h2>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-500 italic uppercase tracking-widest">Total Outflow</p>
            <p className="text-lg font-black text-rose-500 italic mt-0.5">{fmt(totalExp)}</p>
          </div>
        </div>

        {/* Chart Section - Height 400px ඉඳන් 250px ට අඩු කළා */}
        <div className="relative h-[250px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                innerRadius={70}  // Radius අඩු කළා
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1500}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || "#e11d48"} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[9px] font-bold text-slate-600 italic tracking-[0.4em] uppercase">Overview</p>
            <p className="text-lg font-black text-rose-500/80 italic tracking-widest mt-1">OUTFLOW</p>
          </div>
        </div>

        {/* Dynamic Legend */}
        {expenseData.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
            {expenseData.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] || "#e11d48" }} />
                  <span className="text-[10px] font-bold text-slate-400 italic uppercase tracking-wider truncate max-w-[60px]" title={item.name}>{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-white italic">{((item.value / totalExp) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold italic tracking-widest text-slate-600 uppercase">NO OUTFLOW DATA</p>
          </div>
        )}
      </div>

      {/* ── INCOME SOURCES (CASH IN) ── */}
      <div className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-[#161b27]/30 p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-500 hover:border-emerald-500/30 hover:bg-white/[0.02]">

        <div className="relative z-10 flex items-start justify-between mb-8">
          <div className="flex items-center gap-3 mt-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] animate-pulse" />
            <h2 className="text-[12px] font-black italic tracking-[0.3em] text-white uppercase">Cash In Analytics</h2>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-500 italic uppercase tracking-widest">Total Inflow</p>
            <p className="text-lg font-black text-emerald-500 italic mt-0.5">{fmt(totalInc)}</p>
          </div>
        </div>

        <div className="relative h-[250px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeData}
                innerRadius={70}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationBegin={300}
                animationDuration={1500}
              >
                {incomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || "#10b981"} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[9px] font-bold text-slate-600 italic tracking-[0.4em] uppercase">Sources</p>
            <p className="text-lg font-black text-emerald-500/80 italic tracking-widest mt-1">INFLOW</p>
          </div>
        </div>

        {incomeData.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
            {incomeData.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] || "#10b981" }} />
                  <span className="text-[10px] font-bold text-slate-400 italic uppercase tracking-wider truncate max-w-[60px]" title={item.name}>{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-white italic">{((item.value / totalInc) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold italic tracking-widest text-slate-600 uppercase">NO INFLOW DATA</p>
          </div>
        )}
      </div>

    </section>
  );
}