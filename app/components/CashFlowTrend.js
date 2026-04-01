"use client";
import { useMemo } from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function CashFlowTrend({ transactions }) {
    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // දවස් අනුව ගනුදෙනු එකතු කිරීම (Group by date)
        const dailyData = {};

        transactions.forEach((t) => {
            // "YYYY-MM-DD" එකෙන් දවස (DD) විතරක් ගන්නවා 
            const day = t.date ? t.date.split("-")[2] : "00";

            if (!dailyData[day]) {
                dailyData[day] = { day, income: 0, expense: 0 };
            }

            if (t.type === "income") {
                dailyData[day].income += t.amount;
            } else if (t.type === "expense") {
                dailyData[day].expense += t.amount;
            }
        });

        // Object එක Array එකක් කරලා දවස් අනුපිළිවෙලට Sort කරනවා
        return Object.values(dailyData).sort((a, b) => parseInt(a.day) - parseInt(b.day));
    }, [transactions]);

    // 🚀 UI Upgrade: Premium Empty State
    if (chartData.length === 0) {
        return (
            <div className="animate-vibe flex h-[250px] sm:h-[300px] w-full flex-col items-center justify-center rounded-[30px] sm:rounded-[40px] border border-white/5 premium-glass p-8 shadow-2xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 border border-slate-700/50 mb-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-slate-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307L21.75 6.75m0 0H16.5m5.25 0v5.25" />
                    </svg>
                </div>
                <p className="text-[12px] font-black italic tracking-widest text-slate-500 uppercase">Awaiting Data Streams</p>
                <p className="text-[9px] font-bold italic tracking-widest text-slate-600 uppercase mt-2">No trends generated for this period</p>
            </div>
        );
    }

    // 🚀 UI Upgrade: Ultra-Premium Tooltip ("Dynamic Island" Feel)
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-[20px] border border-white/10 bg-[#080b12]/80 p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl ring-1 ring-white/5">
                    <p className="mb-3 text-[10px] sm:text-xs font-black italic tracking-[0.2em] text-slate-400 uppercase border-b border-white/5 pb-2">DAY <span className="text-white">{label}</span></p>
                    <div className="flex flex-col gap-2">
                        {payload.map((p, i) => (
                            <div key={i} className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${p.dataKey === 'income' ? 'bg-emerald-400 text-emerald-400' : 'bg-rose-400 text-rose-400'}`} />
                                    <p className="text-[9px] sm:text-[10px] font-black italic tracking-widest text-slate-300 uppercase">
                                        {p.dataKey}
                                    </p>
                                </div>
                                <p className={`text-sm sm:text-base font-black italic tracking-wider ${p.dataKey === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <span className="text-[10px] mr-1 opacity-70">Rs.</span>
                                    {new Intl.NumberFormat("en-LK").format(p.value)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        // 🚀 UI Upgrade: Smooth Load Animation & Premium Container
        <section className="animate-vibe w-full rounded-[30px] sm:rounded-[40px] border border-white/5 premium-glass p-5 sm:p-8 shadow-2xl relative overflow-hidden" style={{ animationDelay: '0.1s' }}>

            {/* Background Subtle Glow for the Chart Area */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                    <h2 className="text-[14px] sm:text-[16px] font-black italic tracking-[0.2em] uppercase text-white drop-shadow-md">Cash Flow Trend</h2>
                    <p className="text-[10px] sm:text-xs font-bold italic tracking-widest text-slate-500 uppercase mt-1">Income vs Expense Daily Waves</p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 bg-black/20 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm w-fit">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        <span className="text-[9px] sm:text-[10px] font-black italic tracking-widest text-slate-300 uppercase">IN</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                        <span className="text-[9px] sm:text-[10px] font-black italic tracking-widest text-slate-300 uppercase">OUT</span>
                    </div>
                </div>
            </div>

            <div className="h-[220px] sm:h-[280px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            {/* 🚀 UI Upgrade: Richer Neon Gradients */}
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fb7185" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {/* More subtle grid lines */}
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />

                        {/* Styled Axis */}
                        <XAxis
                            dataKey="day"
                            stroke="#475569"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold', fontStyle: 'italic' }}
                            dy={10}
                        />

                        {/* Premium Tooltip cursor line */}
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }} />

                        {/* Chart Lines with heavier stroke for Neon feel */}
                        <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" activeDot={{ r: 6, fill: '#080b12', stroke: '#34d399', strokeWidth: 3 }} />
                        <Area type="monotone" dataKey="expense" stroke="#fb7185" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 6, fill: '#080b12', stroke: '#fb7185', strokeWidth: 3 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}