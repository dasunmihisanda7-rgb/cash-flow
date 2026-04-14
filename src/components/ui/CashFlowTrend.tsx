import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTransactions } from "@/context/TransactionContext";

function CashFlowTrend() {
  const { transactions } = useTransactions();

  const getMonthData = () => {
    const months: { key: string; name: string; income: number; expense: number }[] = [];
    const now = new Date();
    
    // Last 3 months (current, -1, -2)
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth() + 1}`,
        name: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        income: 0,
        expense: 0
      });
    }

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const tKey = `${tDate.getFullYear()}-${tDate.getMonth() + 1}`;
      const monthObj = months.find(m => m.key === tKey);
      if (monthObj) {
        if (t.type === 'income') monthObj.income += t.amount;
        else monthObj.expense += t.amount;
      }
    });

    return months;
  };

  const data = getMonthData();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(val);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[rgb(10,14,23)]/95 backdrop-blur-3xl border border-white/20 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest mb-2">{payload[0].payload.name}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[9px] font-black text-slate-400 uppercase">INCOME</span>
              <span className="text-xs font-black italic text-[#B026FF]">Rs. {formatCurrency(payload[0].value)}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-[9px] font-black text-slate-400 uppercase">EXPENSE</span>
              <span className="text-xs font-black italic text-[#FF0043]">Rs. {formatCurrency(payload[1].value)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[rgb(7,10,18)] border border-slate-800 rounded-[35px] p-8 shadow-2xl w-full">
      <h3 className="text-xl font-black italic text-white uppercase tracking-wider mb-8 w-full text-center">3-MONTH CASH FLOW TREND</h3>
      
      <div className="w-full h-80 relative">
        <ResponsiveContainer width="100%" height="100%" debounce={100}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bar-income" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B026FF" stopOpacity={1}/>
                <stop offset="100%" stopColor="#7000FF" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="bar-expense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF0043" stopOpacity={1}/>
                <stop offset="100%" stopColor="#B91C1C" stopOpacity={1}/>
              </linearGradient>
              <filter id="bar-glow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 10, fontWeight: 900, fontStyle: 'italic' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 10, fontWeight: 900, fontStyle: 'italic' }}
              tickFormatter={(val) => `Rs.${formatCurrency(val)}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar 
              dataKey="income" 
              fill="url(#bar-income)" 
              radius={[6, 6, 0, 0]} 
              filter="url(#bar-glow)"
              barSize={40}
            />
            <Bar 
              dataKey="expense" 
              fill="url(#bar-expense)" 
              radius={[6, 6, 0, 0]} 
              filter="url(#bar-glow)"
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-12 mt-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-sm shadow-[0_0_10px_#B026FF]" style={{ background: 'linear-gradient(to bottom, #B026FF, #7000FF)' }} />
          <span className="text-[10px] font-black italic text-slate-400 uppercase tracking-widest">INCOME</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-sm shadow-[0_0_10px_#FF0043]" style={{ background: 'linear-gradient(to bottom, #FF0043, #B91C1C)' }} />
          <span className="text-[10px] font-black italic text-slate-400 uppercase tracking-widest">EXPENSE</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(CashFlowTrend);
