"use client";
import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";

// ── 1. ULTRA-PREMIUM NEON CATEGORY COLORS ─────────────────────
const CATEGORY_COLORS = {
  // Income
  Salary: "#00E676",      // Neon Green
  Freelance: "#D500F9",   // Neon Purple
  Investments: "#FFEA00", // Neon Yellow
  Business: "#00B0FF",    // Neon Blue
  Bonus: "#FF3D00",       // Neon Orange
  // Expenses
  Food: "#FF1744",        // Neon Red-Pink
  Transport: "#00E5FF",   // Neon Cyan
  Utilities: "#FF9100",   // Neon Orange
  Health: "#F50057",      // Deep Pink
  Entertainment: "#76FF03",// Lime Green
  Education: "#651FFF",   // Indigo/Violet
  Other: "#94A3B8",       // Slate
};

const DEFAULT_INCOME_COLOR = "#00E676";
const DEFAULT_EXPENSE_COLOR = "#FF1744";

const fmt = (n) =>
  `Rs. ${new Intl.NumberFormat("en-LK", { minimumFractionDigits: 0 }).format(n)}`;

// ── 2. CUSTOM TOOLTIP DESIGN ─────────────────────
const CustomTooltip = ({ active, payload, type }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const defaultColor = type === "income" ? DEFAULT_INCOME_COLOR : DEFAULT_EXPENSE_COLOR;
    const categoryColor = CATEGORY_COLORS[data.name] || defaultColor;

    return (
      <div className="pointer-events-none flex flex-col justify-center rounded-[20px] border border-white/10 bg-[#080b12]/90 px-4 py-3 sm:px-5 sm:py-4 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl outline-none ring-1 ring-white/5">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: categoryColor, boxShadow: `0 0 12px ${categoryColor}` }}
          />
          <p className="text-[9px] sm:text-[11px] font-black italic text-slate-300 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            {data.name}
          </p>
        </div>
        <p className="text-[14px] sm:text-[16px] font-black text-white italic tracking-widest pl-4 drop-shadow-md">
          {fmt(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

// ── 3. ACTIVE SHAPE (HOVER EFFECT) ─────────────────────
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  const rawColor = CATEGORY_COLORS[payload.name] || fill;

  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight="900" className="uppercase tracking-[0.2em]" style={{ fontStyle: 'italic' }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill={rawColor} fontSize={22} fontStyle="italic" fontWeight="900" style={{ filter: `drop-shadow(0px 0px 10px ${rawColor}80)` }}>
        {fmt(payload.value)}
      </text>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={40}
        style={{ filter: `drop-shadow(0px 0px 15px ${rawColor}99)` }} // Intense glow on hover
      />
    </g>
  );
};

// ── 4. GRADIENT DEFINITIONS ─────────────────────
const renderDefs = (data, isIncome, namespace) => {
  const allDefs = data.map((item) => {
    const fallbackColor = isIncome ? DEFAULT_INCOME_COLOR : DEFAULT_EXPENSE_COLOR;
    const color = CATEGORY_COLORS[item.name] || fallbackColor;
    return (
      <linearGradient id={`${namespace}-color-${item.name}`} x1="0" y1="0" x2="1" y2="1" key={`${namespace}-${item.name}`}>
        <stop offset="0%" stopColor={color} stopOpacity={1} />
        <stop offset="100%" stopColor={color} stopOpacity={0.5} />
      </linearGradient>
    );
  });

  return <defs>{allDefs}</defs>;
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
        </div>

        <div className="relative h-[220px] sm:h-[280px] w-full mb-6 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {renderDefs(expenseData, false, "exp")}
              <Pie
                activeIndex={activeIndexExp}
                activeShape={renderActiveShape}
                data={expenseData}
                innerRadius="75%"
                outerRadius="90%"
                paddingAngle={10}
                cornerRadius={40}
                stroke="none"
                dataKey="value"
                animationBegin={100}
                animationDuration={1500}
                onMouseEnter={(_, index) => setActiveIndexExp(index)}
                onMouseLeave={() => setActiveIndexExp(-1)}
              >
                {expenseData.map((entry, index) => {
                  const rawColor = CATEGORY_COLORS[entry.name] || DEFAULT_EXPENSE_COLOR;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#exp-color-${entry.name})`}
                      style={{ filter: `drop-shadow(0px 0px 8px ${rawColor}66)` }} // Base subtle glow
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip type="expense" />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total - Hidden when hovered */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${activeIndexExp !== -1 ? "opacity-0" : "opacity-100"}`}>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">TOTAL OUTFLOW</p>
            <p className="text-2xl sm:text-3xl font-black text-rose-400 italic drop-shadow-[0_0_15px_rgba(244,63,94,0.6)] mt-1">{fmt(totalExp)}</p>
          </div>
        </div>

        {/* Legend */}
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
                  <span className="text-[8px] sm:text-[11px] font-black italic" style={{ color: itemColor }}>{((item.value / totalExp) * 100).toFixed(0)}%</span>
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
        </div>

        <div className="relative h-[220px] sm:h-[280px] w-full mb-6 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {renderDefs(incomeData, true, "inc")}
              <Pie
                activeIndex={activeIndexInc}
                activeShape={renderActiveShape}
                data={incomeData}
                innerRadius="75%"
                outerRadius="90%"
                paddingAngle={10}
                cornerRadius={40}
                stroke="none"
                dataKey="value"
                animationBegin={400}
                animationDuration={1500}
                onMouseEnter={(_, index) => setActiveIndexInc(index)}
                onMouseLeave={() => setActiveIndexInc(-1)}
              >
                {incomeData.map((entry, index) => {
                  const rawColor = CATEGORY_COLORS[entry.name] || DEFAULT_INCOME_COLOR;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#inc-color-${entry.name})`}
                      style={{ filter: `drop-shadow(0px 0px 8px ${rawColor}66)` }} // Base subtle glow
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip type="income" />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total - Hidden when hovered */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${activeIndexInc !== -1 ? "opacity-0" : "opacity-100"}`}>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">TOTAL INFLOW</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 italic drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] mt-1">{fmt(totalInc)}</p>
          </div>
        </div>

        {/* Legend */}
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
                  <span className="text-[8px] sm:text-[11px] font-black italic" style={{ color: itemColor }}>{((item.value / totalInc) * 100).toFixed(0)}%</span>
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