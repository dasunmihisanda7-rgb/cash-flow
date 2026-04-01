"use client";

const VARIANTS = {
  noActivity: {
    icon: "🌑",
    title: "No Activity Logged",
    subtitle: "Add your first transaction to get started.",
    action: { label: "Add Transaction →", tab: "CONTROL" },
  },
  noAnalytics: {
    icon: "📡",
    title: "No Data to Analyze",
    subtitle: "Log some transactions first to see your analytics.",
    action: null,
  },
};

export default function EmptyState({ variant = "noActivity", setActiveTab }) {
  const cfg = VARIANTS[variant] || VARIANTS.noActivity;
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center gap-4">
      <span className="text-5xl opacity-30">{cfg.icon}</span>
      <p className="text-[12px] font-black italic tracking-widest text-slate-400 uppercase">
        {cfg.title}
      </p>
      <p className="text-[10px] font-bold italic tracking-wider text-slate-600 uppercase max-w-[200px]">
        {cfg.subtitle}
      </p>
      {cfg.action && setActiveTab && (
        <button
          onClick={() => setActiveTab(cfg.action.tab)}
          className="click-pop mt-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-5 py-2 text-[9px] font-black italic tracking-widest text-sky-400 uppercase hover:bg-sky-500/20 transition-all"
        >
          {cfg.action.label}
        </button>
      )}
    </div>
  );
}