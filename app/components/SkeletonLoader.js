"use client";

export default function SkeletonLoader() {
    return (
        <div className="flex flex-col relative w-full min-h-screen pt-[max(5rem,env(safe-area-inset-top))]">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-10 animate-vibe">

                {/* User Card Skeletons */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                    {[0, 1].map(i => (
                        <div key={i} className="relative overflow-hidden rounded-[30px] sm:rounded-[60px] border border-white/5 scroll-glass min-h-[140px] sm:min-h-[200px] p-4 sm:p-10 flex flex-col justify-between"
                            style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="skeleton-shimmer h-3 sm:h-4 w-14 sm:w-20 rounded-full mb-auto" />
                            <div className="skeleton-shimmer h-8 sm:h-12 w-3/4 rounded-xl mt-8" />
                        </div>
                    ))}
                </div>

                {/* Summary Card Skeletons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-6">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="relative overflow-hidden rounded-[24px] sm:rounded-[40px] border border-white/5 scroll-glass min-h-[110px] sm:min-h-[140px] p-3 sm:p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="skeleton-shimmer h-2 sm:h-3 w-10 sm:w-14 rounded-full" />
                                <div className="skeleton-shimmer h-5 w-5 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl" />
                            </div>
                            <div>
                                <div className="skeleton-shimmer h-6 sm:h-8 w-full rounded-lg mb-1.5" />
                                <div className="skeleton-shimmer h-3 sm:h-4 w-1/2 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity Skeletons */}
                <div className="mt-12 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="skeleton-shimmer h-8 w-8 rounded-xl shrink-0" />
                        <div className="skeleton-shimmer h-3 w-24 rounded-full" />
                    </div>
                    <div className="rounded-[24px] sm:rounded-[40px] border border-white/5 scroll-glass p-3 sm:p-5 space-y-2">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-transparent">
                                <div className="skeleton-shimmer h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="skeleton-shimmer h-3 sm:h-4 w-2/3 rounded-full" />
                                    <div className="skeleton-shimmer h-2 sm:h-3 w-1/3 rounded-full" />
                                </div>
                                <div className="skeleton-shimmer h-4 sm:h-5 w-16 sm:w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}