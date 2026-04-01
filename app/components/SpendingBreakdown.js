"use client";
// BUG-13 FIX: renderDefs() was called twice (once per chart), creating duplicate
// SVG gradient IDs in the DOM. The SVG spec disallows duplicates — the browser
// resolves the conflict by using the first occurrence, so the income chart
// silently inherited expense chart colors for shared category names.
// FIX: Each chart now passes a namespace ("exp" / "inc") that prefixes all IDs.
import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";

// ── 1. CATEGORY CONFIGURATION ─────────────────────
const CATEGORY_COLORS = {
  Salary: "#34d399", Freelance: "#10b981", Investments: "#059669", Business: "#047857", Bonus: "#064e3b",
  Food: "#fb7185", Transport: "#f43f5e", Utilities: "#e11d48",
  Health: "#be123c", Entertainment: "#9f1239", Education: "#881337", Other: "#475569",
};

const DEFAULT_INCOME_COLOR = "#34d399";
const DEFAULT_EXPENSE_COLOR = "#fb7185";

const fmt = (n) =>
  `Rs. ${new Intl.NumberFormat("en-LK", { minimumFractionDigits: 0 }).format(n)}`;

// ── 2. CUSTOM TOOLTIP DESIGN ─────────────────────
const CustomTooltip = ({ active, payload, type }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const defaultColor = type === "income" ? DEFAULT_INCOME_COLOR : DEFAULT_EXPENSE_COLOR;
    const categoryColor = CATEGORY_COLORS[data.name] || defaultColor;

    return (
      <div className="pointer-events-none flex flex-col justify-center rounded-[20px] border border-white/10 bg-[#080b12]/80 px-4 py-3 sm:px-5 sm:py-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl outline-none ring-1 ring-white/5">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: categoryColor, boxShadow: `0 0 10px ${categoryColor}` }}
          />
          <p className="text-[9px] sm:text-[11px] font-black italic text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            {data.name}
          </p>
        </div>
        <p className="text-[14px] sm:text-[16px] font-black text-white italic tracking-widest pl-4">
          {fmt(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

// ── 3. ACTIVE SHAPE (HOVER EFFECT) ─────────────────────
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight="bold" className="uppercase tracking-widest">
        {payload.name}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill={fill} fontSize={24} fontStyle="italic" fontWeight="900" style={{ filter: `drop-shadow(0px 0px 8px ${fill})` }}>
        {fmt(payload.value)}
      </text>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={40}
        filter="url(#glow)"
      />
    </g>
  );
};

// BUG-13 FIX: `namespace` parameter added to prefix all gradient IDs, preventing
// duplicate SVG IDs when both expense and income charts are rendered together.
const renderDefs = (data, isIncome, namespace) => {
  const knownDefs = Object.entries(CATEGORY_COLORS).map(([key, color]) => (
    <linearGradient id={`${namespace}-color-${key}`} x1="0" y1="0" x2="1" y2="1" key={key}>
      <stop offset="0%" stopColor={color} stopOpacity={1} />
      <stop offset="100%" stopColor={color} stopOpacity={0.6} />
    </linearGradient>
  ));

  const unknownDefs = data
    .filter((item) => !CATEGORY_COLORS[item.name])
    .map((item) => {
      const fallbackColor = isIncome ? DEFAULT_INCOME_COLOR : DEFAULT_EXPENSE_COLOR;
      return (
        <linearGradient id={`${namespace}-color-${item.name}`} x1="0" y1="0" x2="1" y2="1" key={`unknown-${item.name}`}>
          <stop offset="0%" stopColor={fallbackColor} stopOpacity={1} />
          <stop offset="100%" stopColor={fallbackColor} stopOpacity={0.6} />
        </linearGradient>
      );
    });

  return (
    <defs>
      {knownDefs}
      {unknownDefs}
      <filter id={`${namespace}-neon-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
};

export default function SpendingBreakdown({ transactions }) {
  const [activeIndexExp, setActiveIndexExp] = useState(-1);
  const [activeIndexInc, setActiveIndexInc] = useState(-1);

  const processData = (type) => {
    const filtered = transactions.filter((t) => t.type === type);
    const stats = filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const expenseData = processData("expense");
  const incomeData = processData("income");

  const totalExp = expenseData.reduce((s, d) => s + d.value, 0);
  const totalInc = incomeData.reduce((s, d) => s + d.value, 0);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">

      {/* ── EXPENSE BREAKDOWN ── */}
      <div className="animate-vibe group relative overflow-hidden rounded-[30px] sm:rounded-[40px] border border-white/5 premium-glass p-5 sm:p-8 shadow-2xl flex flex-col">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 mt-1">
            <div className="h-2 w-2 shrink-0 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)] animate-pulse" />
            <h2 className="text-[10px] sm:text-[14px] font-black italic tracking-widest sm:tracking-[0.3em] text-white uppercase truncate">Cash Out Analytics</h2>
          </div>
          <div className="text-left sm:text-right bg-black/20 px-3 py-2 sm:px-0 sm:py-0 sm:bg-transparent rounded-xl border border-white/5 sm:border-transparent w-fit sm:w-auto">
            <p className="text-[7px] sm:text-[9px] font-bold text-slate-500 italic uppercase tracking-widest">Total Outflow</p>
            <p className="text-[14px] sm:text-xl font-black text-rose-400 italic mt-0.5 truncate">{fmt(totalExp)}</p>
          </div>
        </div>

        <div className="relative h-[180px] sm:h-[250px] w-full mb-6 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {renderDefs(expenseData, false, "exp")}
              <Pie
                activeIndex={activeIndexExp}
                activeShape={renderActiveShape}
                data={expenseData}
                innerRadius="75%"
                outerRadius="90%"
                paddingAngle={8}
                cornerRadius={40}
                stroke="none"
                dataKey="value"
                animationBegin={100}
                animationDuration={1500}
                filter="url(#exp-neon-glow)"
                onMouseEnter={(_, index) => setActiveIndexExp(index)}
                onMouseLeave={() => setActiveIndexExp(-1)}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#exp-color-${entry.name})`} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip type="expense" />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>

          <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${activeIndexExp !== -1 ? "opacity-0" : "opacity-100"}`}>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">TOTAL OUTFLOW</p>
            <p className="text-2xl sm:text-3xl font-black text-rose-400 italic drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] mt-0.5">{fmt(totalExp)}</p>
          </div>
        </div>

        {expenseData.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-white/5 mt-auto relative z-10">
            {expenseData.slice(0, 4).map((item, i) => {
              const itemColor = CATEGORY_COLORS[item.name] || DEFAULT_EXPENSE_COLOR;
              return (
                <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-black/30 border border-white/5 hover:bg-white/5 transition-colors cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: itemColor, boxShadow: `0 0 10px ${itemColor}` }} />
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-300 italic uppercase tracking-wider truncate max-w-[50px] sm:max-w-[80px]" title={item.name}>{item.name}</span>
                  </div>
                  <span className="text-[8px] sm:text-[11px] font-black text-rose-300 italic">{((item.value / totalExp) * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pt-4 sm:pt-6 border-t border-white/5 text-center mt-auto">
            <p className="text-[8px] sm:text-[10px] font-bold italic tracking-widest text-slate-600 uppercase">NO OUTFLOW DATA</p>
          </div>
        )}
      </div>

      {/* ── INCOME SOURCES ── */}
      <div className="animate-vibe group relative overflow-hidden rounded-[30px] sm:rounded-[40px] border border-white/5 premium-glass p-5 sm:p-8 shadow-2xl flex flex-col" style={{ animationDelay: "0.2s" }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 mt-1">
            <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)] animate-pulse" />
            <h2 className="text-[10px] sm:text-[14px] font-black italic tracking-widest sm:tracking-[0.3em] text-white uppercase truncate">Cash In Analytics</h2>
          </div>
          <div className="text-left sm:text-right bg-black/20 px-3 py-2 sm:px-0 sm:py-0 sm:bg-transparent rounded-xl border border-white/5 sm:border-transparent w-fit sm:w-auto">
            <p className="text-[7px] sm:text-[9px] font-bold text-slate-500 italic uppercase tracking-widest">Total Inflow</p>
            <p className="text-[14px] sm:text-xl font-black text-emerald-400 italic mt-0.5 truncate">{fmt(totalInc)}</p>
          </div>
        </div>

        <div className="relative h-[180px] sm:h-[250px] w-full mb-6 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {renderDefs(incomeData, true, "inc")}
              <Pie
                activeIndex={activeIndexInc}
                activeShape={renderActiveShape}
                data={incomeData}
                innerRadius="75%"
                outerRadius="90%"
                paddingAngle={8}
                cornerRadius={40}
                stroke="none"
                dataKey="value"
                animationBegin={400}
                animationDuration={1500}
                filter="url(#inc-neon-glow)"
                onMouseEnter={(_, index) => setActiveIndexInc(index)}
                onMouseLeave={() => setActiveIndexInc(-1)}
              >
                {incomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#inc-color-${entry.name})`} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip type="income" />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>

          <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${activeIndexInc !== -1 ? "opacity-0" : "opacity-100"}`}>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">TOTAL INFLOW</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 italic drop-shadow-[0_0_12px_rgba(52,211,153,0.6)] mt-0.5">{fmt(totalInc)}</p>
          </div>
        </div>

        {incomeData.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-white/5 mt-auto relative z-10">
            {incomeData.slice(0, 4).map((item, i) => {
              const itemColor = CATEGORY_COLORS[item.name] || DEFAULT_INCOME_COLOR;
              return (
                <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-black/30 border border-white/5 hover:bg-white/5 transition-colors cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: itemColor, boxShadow: `0 0 10px ${itemColor}` }} />
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-300 italic uppercase tracking-wider truncate max-w-[50px] sm:max-w-[80px]" title={item.name}>{item.name}</span>
                  </div>
                  <span className="text-[8px] sm:text-[11px] font-black text-emerald-300 italic">{((item.value / totalInc) * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pt-4 sm:pt-6 border-t border-white/5 text-center mt-auto">
            <p className="text-[8px] sm:text-[10px] font-bold italic tracking-widest text-slate-600 uppercase">NO INFLOW DATA</p>
          </div>
        )}
      </div>

    </section>
  );
}