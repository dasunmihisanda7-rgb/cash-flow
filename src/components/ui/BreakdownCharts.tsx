import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTransactions } from "@/context/TransactionContext";

const INCOME_GRADIENTS = [
  { start: '#B026FF', end: '#FF00D4' }, // Cyber Purple to Pink
  { start: '#00F5FF', end: '#00FF9C' }, // Electric Cyan to Green
  { start: '#FFD700', end: '#FF3131' }, // Neon Gold to Red
  { start: '#39FF14', end: '#05FFA1' }, // Toxic Lime to Mint
  { start: '#7B2BFF', end: '#FF00E5' }, // Ultra Violet to Fuchsia
];

const EXPENSE_GRADIENTS = [
  { start: '#FF0043', end: '#7000FF' }, // Radical Red to Violet
  { start: '#FF6B00', end: '#FF0055' }, // Blaze Orange to Rose
  { start: '#2E2EFF', end: '#BC00FF' }, // Deep Blue to Magenta
  { start: '#FF007F', end: '#FFB400' }, // Hot Pink to Amber
  { start: '#00FF7F', end: '#ECFF00' }, // Spring Green to Yellow
];

function BreakdownCharts() {
  const { transactions } = useTransactions();

  const processData = (type: 'income' | 'expense') => {
    const filtered = transactions.filter(t => t.type === type);
    const byCategory = filtered.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 5); // Show top 5
  };

  const incomeData = processData('income');
  const expenseData = processData('expense');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(val).replace('LKR', 'Rs.');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[rgb(10,14,23)]/95 backdrop-blur-3xl border border-white/20 p-4 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <p className="text-[10px] font-black italic text-slate-500 uppercase tracking-widest mb-1">{payload[0].name}</p>
          <p className="text-sm font-black italic text-white">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      {/* Income Breakdown */}
      <div className="bg-[rgb(7,10,18)] border border-slate-800 rounded-[35px] p-8 shadow-2xl flex flex-col items-center">
        <h3 className="text-xl font-black italic text-white uppercase tracking-wider mb-8 w-full text-center">INCOME BREAKDOWN</h3>
        <div className="w-full h-96 relative">
          {incomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <PieChart>
                <defs>
                  {incomeData.map((_, index) => {
                    const grad = INCOME_GRADIENTS[index % INCOME_GRADIENTS.length];
                    return (
                      <linearGradient key={`income-grad-${index}`} id={`income-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={grad.start} stopOpacity={1}/>
                        <stop offset="100%" stopColor={grad.end} stopOpacity={1}/>
                      </linearGradient>
                    );
                  })}
                  <filter id="glow-income">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={130}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  filter="url(#glow-income)"
                >
                  {incomeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#income-grad-${index})`}
                      className="transition-all duration-300 hover:opacity-90 cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold italic text-xs uppercase">NO INCOME DATA</div>
          )}
        </div>
        <div className="w-full mt-6 space-y-2">
          {incomeData.map((item, index) => {
             const grad = INCOME_GRADIENTS[index % INCOME_GRADIENTS.length];
             return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ background: `linear-gradient(to bottom, ${grad.start}, ${grad.end})`, boxShadow: `0 0 15px ${grad.start}` }} />
                  <span className="text-[10px] font-black italic text-slate-400 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-[11px] font-black italic text-white">{formatCurrency(item.value)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-[rgb(7,10,18)] border border-slate-800 rounded-[35px] p-8 shadow-2xl flex flex-col items-center">
        <h3 className="text-xl font-black italic text-white uppercase tracking-wider mb-8 w-full text-center">EXPENSE BREAKDOWN</h3>
        <div className="w-full h-96 relative">
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <PieChart>
                <defs>
                  {expenseData.map((_, index) => {
                     const grad = EXPENSE_GRADIENTS[index % EXPENSE_GRADIENTS.length];
                     return (
                      <linearGradient key={`expense-grad-${index}`} id={`expense-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={grad.start} stopOpacity={1}/>
                        <stop offset="100%" stopColor={grad.end} stopOpacity={1}/>
                      </linearGradient>
                    );
                  })}
                  <filter id="glow-expense">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={130}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  filter="url(#glow-expense)"
                >
                  {expenseData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#expense-grad-${index})`}
                      className="transition-all duration-300 hover:opacity-90 cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold italic text-xs uppercase">NO EXPENSE DATA</div>
          )}
        </div>
        <div className="w-full mt-6 space-y-2">
          {expenseData.map((item, index) => {
            const grad = EXPENSE_GRADIENTS[index % EXPENSE_GRADIENTS.length];
            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ background: `linear-gradient(to bottom, ${grad.start}, ${grad.end})`, boxShadow: `0 0 15px ${grad.start}` }} />
                  <span className="text-[10px] font-black italic text-slate-400 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-[11px] font-black italic text-white">{formatCurrency(item.value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default React.memo(BreakdownCharts);
