"use client";
import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";

// ── 1. ULTRA-PREMIUM MULTI-COLOR NEON PALETTE ─────────────────────
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

const CATEGORY_EMOJI = {
  Salary: "💰", Freelance: "💻", Investments: "📈", Business: "🏢", Bonus: "🎁",
  Food: "🍔", Transport: "🚕", Utilities: "⚡", Health: "🏥", Entertainment: "🎬", Education: "📚", Other: "📦"
};

const DEFAULT_INCOME_COLOR = "#00E676";
const DEFAULT_EXPENSE_COLOR = "#FF1744";

const fmt = (n) => new Intl.NumberFormat("en-LK", { minimumFractionDigits: 0 }).format(n);

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
          Rs. {fmt(data.value)}
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
      <text x={cx} y={cy + 18} textAnchor="middle" fill="#ffffff" fontSize={24} fontStyle="italic" fontWeight="900" style={{ filter: `drop-shadow(0px 0px 12px rgba(255,255,255,0.6))` }}>
        <tspan fontSize={14} fill="#cbd5e1" dy="-2">Rs. </tspan>
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
        style={{ filter: `drop-shadow(0px 0px 15px ${rawColor}99)` }}
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
        <stop offset="100%" stopColor={color} stopOpacity={0.6} />
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

  // Background track data for the speedometer effect
  const backgroundTrackData = [{ value: 100 }];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">

      {/* ── EXPENSE BREAKDOWN ── */}
      <div className="animate-vibe group relative overflow-hidden rounded-[30px] sm:rounded-[40px] border border-white/5 premium-glass p-5 sm:p-8 shadow-2xl flex flex-col">
        {/* Ambient Corner Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 mt-1">
            <div className="h-2 w-2 shrink-0 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)] animate-pulse" />
            <h2 className="text-[10px] sm:text-[14px] font-black italic tracking-widest sm:tracking-[0.3em] text-white uppercase truncate">Cash Out Analytics</h2>
          </div>
        </div>

        <div className="relative h-[220px] sm:h-[280px] w-full mb-6 flex-1 flex items-center justify-center">
          {/* Centered Ambient Glow behind the chart */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />

          <ResponsiveContainer width="100%" height="100%" className="relative z-10">
            <PieChart>
              {renderDefs(expenseData, false, "exp")}

              {/* Ghost Background Track */}
              <Pie
                data={backgroundTrackData}
                innerRadius="75%"
                outerRadius="90%"
                fill="rgba(255,255,255,0.04)"
                stroke="none"
                dataKey="value"
                isAnimationActive={false}
              />

              {/* Main Data Chart */}
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
                onMouseEnter={(_, index) => setActiveIndexExp(index)}
                onMouseLeave={() => setActiveIndexExp(-1)}
              >
                {expenseData.map((entry, index) => {
                  const rawColor = CATEGORY_COLORS[entry.name] || DEFAULT_EXPENSE_COLOR;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#exp-color-${entry.name})`}
                      style={{ filter: `drop-shadow(0px 0px 8px ${rawColor}66)` }}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip type="expense" />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total - Pure White Glow */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${activeIndexExp !== -1 ? "opacity-0" : "opacity-100"}`}>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">TOTAL OUTFLOW</p>
            <div className="flex items-baseline gap-1.5 mt-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              <span className="text-sm font-bold text-slate-300 italic">Rs.</span>
              <p className="text-3xl sm:text-4xl font-black text-white italic">{fmt(totalExp)}</p>
            </div>
          </div>
        </div>

        {/* Ultra-Premium Glass Legend */}
        {expenseData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 sm:pt-6 border-t border-white/5 mt-auto relative z-10">
            {expenseData.slice(0, 4).map((item, i) => {
              const itemColor = CATEGORY_COLORS[item.name] || DEFAULT_EXPENSE_COLOR;
              const emoji = CATEGORY_EMOJI[item.name] || "📦";
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-[18px] bg-white/[0.03] backdrop-blur-md border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.2)] hover:bg-white/[0.06] transition-colors cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border border-white/5 text-[12px] shadow-inner">
                      {emoji}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-200 uppercase tracking-widest truncate max-w-[80px]" title={item.name}>{item.name}</span>
                      <span className="text-[10px] sm:text-[11px] font-black italic mt-0.5" style={{ color: itemColor }}>{((item.value / totalExp) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <span className="text-[11px] sm:text-[13px] font-black text-white italic drop-shadow-md pr-1">{fmt(item.value)}</span>
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
        {/* Ambient Corner Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 mt-1">
            <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)] animate-pulse" />
            <h2 className="text-[10px] sm:text-[14px] font-black italic tracking-widest sm:tracking-[0.3em] text-white uppercase truncate">Cash In Analytics</h2>
          </div>
        </div>

        <div className="relative h-[220px] sm:h-[280px] w-full mb-6 flex-1 flex items-center justify-center">
          {/* Centered Ambient Glow behind the chart */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

          <ResponsiveContainer width="100%" height="100%" className="relative z-10">
            <PieChart>
              {renderDefs(incomeData, true, "inc")}

              {/* Ghost Background Track */}
              <Pie
                data={backgroundTrackData}
                innerRadius="75%"
                outerRadius="90%"
                fill="rgba(255,255,255,0.04)"
                stroke="none"
                dataKey="value"
                isAnimationActive={false}
              />

              {/* Main Data Chart */}
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
                onMouseEnter={(_, index) => setActiveIndexInc(index)}
                onMouseLeave={() => setActiveIndexInc(-1)}
              >
                {incomeData.map((entry, index) => {
                  const rawColor = CATEGORY_COLORS[entry.name] || DEFAULT_INCOME_COLOR;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#inc-color-${entry.name})`}
                      style={{ filter: `drop-shadow(0px 0px 8px ${rawColor}66)` }}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip type="income" />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total - Pure White Glow */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${activeIndexInc !== -1 ? "opacity-0" : "opacity-100"}`}>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">TOTAL INFLOW</p>
            <div className="flex items-baseline gap-1.5 mt-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              <span className="text-sm font-bold text-slate-300 italic">Rs.</span>
              <p className="text-3xl sm:text-4xl font-black text-white italic">{fmt(totalInc)}</p>
            </div>
          </div>
        </div>

        {/* Ultra-Premium Glass Legend */}
        {incomeData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 sm:pt-6 border-t border-white/5 mt-auto relative z-10">
            {incomeData.slice(0, 4).map((item, i) => {
              const itemColor = CATEGORY_COLORS[item.name] || DEFAULT_INCOME_COLOR;
              const emoji = CATEGORY_EMOJI[item.name] || "📦";
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-[18px] bg-white/[0.03] backdrop-blur-md border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.2)] hover:bg-white/[0.06] transition-colors cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border border-white/5 text-[12px] shadow-inner">
                      {emoji}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-200 uppercase tracking-widest truncate max-w-[80px]" title={item.name}>{item.name}</span>
                      <span className="text-[10px] sm:text-[11px] font-black italic mt-0.5" style={{ color: itemColor }}>{((item.value / totalInc) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <span className="text-[11px] sm:text-[13px] font-black text-white italic drop-shadow-md pr-1">{fmt(item.value)}</span>
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