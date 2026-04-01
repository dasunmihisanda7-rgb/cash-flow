"use client";
import { useCallback } from "react";

export function useHaptic() {
    // ෆෝන් එකේ Vibrate මෝටර් එක තියෙනවද කියලා බලනවා
    const canVibrate = typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator;

    return {
        light: useCallback(() => canVibrate && navigator.vibrate(10), [canVibrate]),
        medium: useCallback(() => canVibrate && navigator.vibrate(20), [canVibrate]),
        success: useCallback(() => canVibrate && navigator.vibrate([15, 30, 15]), [canVibrate]),
        error: useCallback(() => canVibrate && navigator.vibrate([30, 20, 30, 20, 60]), [canVibrate]),
        select: useCallback(() => canVibrate && navigator.vibrate([5, 50, 5]), [canVibrate]),
    };
}