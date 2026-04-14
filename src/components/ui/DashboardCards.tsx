import { CircleDollarSign, TrendingUp, TrendingDown } from "lucide-react";

type DashboardCardsProps = {
  balance: number;
  income: number;
  expense: number;
};

export default function DashboardCards({ balance, income, expense }: DashboardCardsProps) {
  const formatter = new Intl.NumberFormat("en-LK", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formatCurrency = (val: number) => `Rs. ${formatter.format(val)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      {/* Total Balance */}
      <div 
        className="relative overflow-hidden px-4 md:px-6 py-6 md:py-10 rounded-[30px] md:rounded-[35px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] group md:hover:shadow-[#3B82F6]/40 md:hover:-translate-y-2 md:hover:scale-[1.02] transition-all duration-500 backdrop-blur-2xl"
        style={{ backgroundColor: "lab(84.7652 -1.94535 -7.93337 / 0.08)" }}
      >
        <div className="flex items-center md:items-start gap-3 md:gap-4 relative z-10">
          <div className="w-14 h-14 md:w-18 md:h-18 rounded-[20px] md:rounded-[25px] bg-[#3B82F6]/10 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-[#3B82F6]/20 transition-colors duration-300 animate-pulse">
            <CircleDollarSign className="w-7 h-7 md:w-9 md:h-9 text-[#3B82F6]" />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1 mt-0 md:mt-[10px]">
            <h3 
              className="text-[8px] md:text-[10px] font-black text-[#62748E] uppercase tracking-wider italic"
              style={{ fontStyle: "italic" }}
            >
              TOTAL BALANCE
            </h3>
            <p 
              className="text-2xl md:text-3xl font-black italic text-white tracking-tight leading-none"
              style={{ fontStyle: "italic" }}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Income */}
      <div 
        className="relative overflow-hidden px-4 md:px-6 py-6 md:py-10 rounded-[30px] md:rounded-[35px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] group md:hover:shadow-emerald-500/40 md:hover:-translate-y-2 md:hover:scale-[1.02] transition-all duration-500 backdrop-blur-2xl"
        style={{ backgroundColor: "lab(84.7652 -1.94535 -7.93337 / 0.08)" }}
      >
        <div className="flex items-center md:items-start gap-3 md:gap-4 relative z-10">
          <div className="w-14 h-14 md:w-18 md:h-18 rounded-[20px] md:rounded-[25px] bg-emerald-500/10 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-emerald-500/20 transition-colors duration-300 animate-pulse">
            <TrendingUp className="w-7 h-7 md:w-9 md:h-9 text-emerald-500" />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1 mt-0 md:mt-[10px]">
            <h3 
              className="text-[8px] md:text-[10px] font-black text-[#62748E] uppercase tracking-wider italic"
              style={{ fontStyle: "italic" }}
            >
              TOTAL INCOME
            </h3>
            <p 
              className="text-2xl md:text-3xl font-black italic text-emerald-500 tracking-tight leading-none"
              style={{ fontStyle: "italic" }}
            >
              {formatCurrency(income)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Expense */}
      <div 
        className="relative overflow-hidden px-4 md:px-6 py-6 md:py-10 rounded-[30px] md:rounded-[35px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] group md:hover:shadow-rose-500/40 md:hover:-translate-y-2 md:hover:scale-[1.02] transition-all duration-500 backdrop-blur-2xl"
        style={{ backgroundColor: "lab(84.7652 -1.94535 -7.93337 / 0.08)" }}
      >
        <div className="flex items-center md:items-start gap-3 md:gap-4 relative z-10">
          <div className="w-14 h-14 md:w-18 md:h-18 rounded-[20px] md:rounded-[25px] bg-rose-500/10 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-rose-500/20 transition-colors duration-300 animate-pulse">
            <TrendingDown className="w-7 h-7 md:w-9 md:h-9 text-rose-500" />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1 mt-0 md:mt-[10px]">
            <h3 
              className="text-[8px] md:text-[10px] font-black text-[#62748E] uppercase tracking-wider italic"
              style={{ fontStyle: "italic" }}
            >
              TOTAL EXPENSE
            </h3>
            <p 
              className="text-2xl md:text-3xl font-black italic tracking-tight leading-none"
              style={{ fontStyle: "italic", color: "rgb(255, 60, 65)" }}
            >
              {formatCurrency(expense)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
