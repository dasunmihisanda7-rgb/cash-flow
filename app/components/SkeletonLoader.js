"use client";

export default function SkeletonLoader() {
    return (
        <div className="w-full animate-vibe space-y-10">

                {/* User Card Skeletons */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-16">
                    {[0, 1].map(i => (
                        <div key={i} className="relative overflow-hidden rounded-[30px] sm:rounded-[60px] border border-white/5 scroll-glass min-h-[140px] sm:min-h-[200px] p-4 sm:p-10 flex flex-col justify-between"
                            style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="absolute -right-2 -bottom-2 sm:right-4 sm:bottom-4 h-24 w-24 sm:h-32 sm:w-32 opacity-[0.02] skeleton-shimmer rounded-full" />
                            <div className="skeleton-shimmer h-3 sm:h-4 w-14 sm:w-20 rounded-md mb-auto" />
                            <div className="flex items-baseline gap-2 mt-8">
                              <div className="skeleton-shimmer h-2 sm:h-3 w-6 rounded-md" />
                              <div className="skeleton-shimmer h-8 sm:h-10 w-[60%] rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Card Skeletons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-6">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="relative overflow-hidden rounded-[24px] sm:rounded-[40px] border border-white/5 scroll-glass min-h-[110px] sm:min-h-[140px] p-3 sm:p-5 flex flex-col justify-between"
                             style={{ animationDelay: `${i * 0.1 + 0.2}s` }}>
                            <div className="flex justify-between items-start">
                                <div className="skeleton-shimmer h-2 sm:h-3 w-10 sm:w-14 rounded-full" />
                                <div className="skeleton-shimmer h-5 w-5 sm:h-8 sm:w-8 rounded-xl" />
                            </div>
                            <div>
                                <div className="skeleton-shimmer h-5 sm:h-7 w-[80%] rounded-md mb-2" />
                                <div className="skeleton-shimmer h-2 sm:h-3 w-[40%] rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity Skeletons */}
                <div className="mt-12 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="skeleton-shimmer h-8 w-8 rounded-xl shrink-0" />
                            <div className="skeleton-shimmer h-3 w-24 rounded-md" />
                        </div>
                        <div className="skeleton-shimmer h-3 w-16 rounded-md" />
                    </div>
                    
                    <div className="rounded-[24px] sm:rounded-[40px] border border-white/5 scroll-glass p-3 sm:p-5 flex flex-col gap-2">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-transparent ${i % 2 === 0 ? 'bg-[#161b27]/40' : 'bg-[#161b27]/80'}`}>
                                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden w-full">
                                    <div className="skeleton-shimmer h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl shrink-0" />
                                    <div className="flex flex-col justify-center gap-2 flex-1">
                                        <div className="skeleton-shimmer h-3 sm:h-4 w-[40%] rounded-md" />
                                        <div className="skeleton-shimmer h-2 sm:h-2.5 w-[25%] rounded-md" />
                                    </div>
                                </div>
                                <div className="skeleton-shimmer h-4 sm:h-5 w-16 sm:w-20 rounded-md shrink-0 ml-4" />
                            </div>
                        ))}
                    </div>
                </div>

        </div>
    );
}