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
        orb1: "rgba(52, 211, 153, 0.22)",    // emerald — boosted for richer bg
        orb2: "rgba(16, 185, 129, 0.14)",
        label: "SURPLUS · HEALTHY",
    },
    NEUTRAL: {
        orb1: "rgba(56, 189, 248, 0.20)",    // sky — boosted
        orb2: "rgba(168, 85, 247, 0.16)",    // purple — boosted
        label: "STABLE · BALANCED",
    },
    WARNING: {
        orb1: "rgba(245, 158, 11, 0.22)",    // amber — boosted
        orb2: "rgba(251, 113, 133, 0.13)",
        label: "CAUTION · HIGH SPEND",
    },
    DANGER: {
        orb1: "rgba(244, 63, 94, 0.28)",     // rose — boosted
        orb2: "rgba(159, 18, 57, 0.18)",
        label: "CRITICAL · OVER BUDGET",
    },
};