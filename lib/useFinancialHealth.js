"use client";
import { useMemo } from "react";

export function useFinancialHealth(income, expense) {
    return useMemo(() => {
        if (income === 0) return "NEUTRAL";
        const ratio = expense / income;
        if (ratio < 0.5) return "SURPLUS";  // වියදම 50% ට අඩුයි
        if (ratio < 0.75) return "NEUTRAL";  // සාමාන්‍යයි
        if (ratio < 0.9) return "WARNING";  // ටිකක් වැඩියි
        return "DANGER";                     // 90% ට වඩා වැඩියි!
    }, [income, expense]);
}

export const HEALTH_CONFIG = {
    SURPLUS: {
        orb1: "rgba(52, 211, 153, 0.12)",    // emerald
        orb2: "rgba(16, 185, 129, 0.07)",
        label: "SURPLUS · HEALTHY",
    },
    NEUTRAL: {
        orb1: "rgba(56, 189, 248, 0.10)",    // sky
        orb2: "rgba(168, 85, 247, 0.08)",    // purple
        label: "STABLE · BALANCED",
    },
    WARNING: {
        orb1: "rgba(245, 158, 11, 0.12)",    // amber
        orb2: "rgba(251, 113, 133, 0.06)",
        label: "CAUTION · HIGH SPEND",
    },
    DANGER: {
        orb1: "rgba(244, 63, 94, 0.15)",     // rose
        orb2: "rgba(159, 18, 57, 0.10)",
        label: "CRITICAL · OVER BUDGET",
    },
};