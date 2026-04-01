"use client";
import { useMemo } from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function CashFlowTrend({ transactions }) {
    const { chartData, totalNetFlow } = useMemo(() => {
        if (!transactions || transactions.length === 0) return { chartData: [], totalNetFlow: 0 };

        const dailyData = {};
        let totalInc = 0;
        let totalExp = 0;

        transactions.forEach((t) => {
            const day = t.date ? t.date.split("-")[2] : "00";

            if (!dailyData[day]) {
                dailyData[day] = { day, income: 0, expense: 0 };
            }

            if (t.type === "income") {
                dailyData[day].income += t.amount;
                totalInc += t.amount;
            } else if (t.type === "expense") {
                dailyData[day].expense += t.amount;
                totalExp += t.amount;
            }
        });

        const sortedData = Object.values(dailyData).sort((a, b) => parseInt(a.day) - parseInt(b.day));
        return { chartData: sortedData, totalNetFlow: totalInc - totalExp };
    }, [transactions]);

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

    // Ultra-Premium Tooltip ("Dynamic Island" Feel)
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-[24px] border border-white/10 bg-[#080b12]/90 p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl ring-1 ring-white/5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                        <p className="text-[10px] sm:text-xs font-black italic tracking-[0.2em] text-slate-400 uppercase">DAY <span className="text-white">{label}</span></p>
                    </div>
                    <div className="flex flex-col gap-3">
                        {payload.map((p, i) => (
                            <div key={i} className="flex items-center justify-between gap-8">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor] ${p.dataKey === 'income' ? 'bg-emerald-400 text-emerald-400' : 'bg-rose-400 text-rose-400'}`} />
                                    <p className="text-[9px] sm:text-[11px] font-black italic tracking-widest text-slate-300 uppercase">
                                        {p.dataKey}
                                    </p>
                                </div>
                                <p className={`text-sm sm:text-lg font-black italic tracking-wider drop-shadow-md ${p.dataKey === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    <span className="text-[10px] sm:text-[11px] mr-1 opacity-70">Rs.</span>
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
        <section className="animate-vibe w-full rounded-[30px] sm:rounded-[40px] border border-white/5 premium-glass p-5 sm:p-8 shadow-2xl relative overflow-hidden" style={{ animationDelay: '0.1s' }}>

            {/* Background Subtle Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Header Area */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                <div className="flex flex-col gap-3">
                    <div>
                        <h2 className="text-[14px] sm:text-[16px] font-black italic tracking-[0.2em] uppercase text-white drop-shadow-md">Cash Flow Trend</h2>
                        <p className="text-[10px] sm:text-xs font-bold italic tracking-widest text-slate-500 uppercase mt-1">Income vs Expense Daily Waves</p>
                    </div>
                    {/* IN / OUT Legend */}
                    <div className="flex items-center gap-4 sm:gap-6 bg-black/30 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md w-fit shadow-inner">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse" />
                            <span className="text-[9px] sm:text-[10px] font-black italic tracking-widest text-slate-300 uppercase">IN</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse" />
                            <span className="text-[9px] sm:text-[10px] font-black italic tracking-widest text-slate-300 uppercase">OUT</span>
                        </div>
                    </div>
                </div>

                {/* Net Flow Balance (Top Right) */}
                <div className="text-left sm:text-right bg-black/20 px-4 py-3 sm:bg-transparent sm:px-0 sm:py-0 rounded-2xl border border-white/5 sm:border-transparent w-fit sm:w-auto">
                    <p className="text-[8px] sm:text-[10px] font-bold italic tracking-widest text-slate-500 uppercase">Net Flow</p>
                    <p className={`text-xl sm:text-2xl font-black italic tracking-widest drop-shadow-[0_0_15px_currentColor] mt-0.5 ${totalNetFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {totalNetFlow > 0 ? '+' : ''}{new Intl.NumberFormat("en-LK").format(totalNetFlow)}
                    </p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-[240px] sm:h-[300px] w-full relative z-10 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            {/* Richer Neon Gradients */}
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fb7185" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {/* Subtle Grid */}
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.04} vertical={false} />

                        {/* Smart X-Axis */}
                        <XAxis
                            dataKey="day"
                            stroke="#475569"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold', fontStyle: 'italic' }}
                            dy={15}
                            interval="preserveStartEnd"
                            minTickGap={20}
                        />

                        {/* Interactive Tooltip & Crosshair */}
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 2, strokeDasharray: '4 4' }}
                        />

                        {/* Glowing Chart Lines with Data Points */}
                        <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#34d399"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorIncome)"
                            style={{ filter: 'drop-shadow(0px 8px 10px rgba(52,211,153,0.3))' }}
                            dot={{ r: 3, stroke: '#34d399', strokeWidth: 2, fill: '#080b12' }}
                            activeDot={{ r: 7, fill: '#34d399', stroke: '#080b12', strokeWidth: 3, style: { filter: 'drop-shadow(0 0 8px #34d399)' } }}
                        />
                        <Area
                            type="monotone"
                            dataKey="expense"
                            stroke="#fb7185"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorExpense)"
                            style={{ filter: 'drop-shadow(0px 8px 10px rgba(244,63,94,0.3))' }}
                            dot={{ r: 3, stroke: '#fb7185', strokeWidth: 2, fill: '#080b12' }}
                            activeDot={{ r: 7, fill: '#fb7185', stroke: '#080b12', strokeWidth: 3, style: { filter: 'drop-shadow(0 0 8px #fb7185)' } }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}