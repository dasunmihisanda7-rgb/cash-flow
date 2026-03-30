"use client";
import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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

    if (chartData.length === 0) {
        return (
            // 🚀 වෙනස් කළ තැන: premium-glass class එක දැම්මා
            <div className="flex h-48 w-full flex-col items-center justify-center rounded-[30px] border border-white/5 premium-glass">
                <p className="text-[12px] font-black italic tracking-widest text-slate-600">NO TREND DATA YET</p>
            </div>
        );
    }

    // Custom Tooltip එක (Chart එක උඩට මවුස් එක ගෙනිච්චම පේන ලස්සන box එක)
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-4 shadow-2xl backdrop-blur-md">
                    <p className="mb-2 text-xs font-bold text-slate-400">DAY {label}</p>
                    {payload.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${p.dataKey === 'income' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <p className="text-sm font-black italic tracking-wider text-white">
                                {p.dataKey.toUpperCase()}: Rs. {new Intl.NumberFormat("en-LK").format(p.value)}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        // 🚀 වෙනස් කළ තැන: premium-glass class එක දැම්මා
        <section className="w-full rounded-[30px] sm:rounded-[40px] border border-white/5 premium-glass p-5 sm:p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-[14px] sm:text-[18px] font-black italic tracking-[0.2em] uppercase text-white">Cash Flow Trend</h2>
                    <p className="text-xs font-semibold text-slate-500">Income vs Expense Daily Waves</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /><span className="text-[10px] font-bold text-slate-400">INCOME</span></div>
                    <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185]" /><span className="text-[10px] font-bold text-slate-400">EXPENSE</span></div>
                </div>
            </div>

            <div className="h-[250px] w-full sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                        <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />

                        <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}