"use client";
import { useCallback } from "react";

export function useParticleBurst() {
    const burst = useCallback((originEl) => {
        if (typeof window === "undefined") return;
        const canvas = document.createElement("canvas");
        canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;";
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext("2d");

        const rect = originEl?.getBoundingClientRect();
        const ox = rect ? rect.left + rect.width / 2 : canvas.width / 2;
        const oy = rect ? rect.top + rect.height / 2 : canvas.height / 2;

        const colors = ["#34d399", "#38bdf8", "#c084fc", "#f6d365", "#ffffff"];
        const particles = Array.from({ length: 32 }, () => ({
            x: ox, y: oy,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.8) * 14,
            life: 1,
            decay: 0.02 + Math.random() * 0.02,
            r: 2 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));

        const frame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            particles.forEach(p => {
                if (p.life <= 0) return;
                alive = true;
                p.x += p.vx; p.y += p.vy; p.vy += 0.4;
                p.life -= p.decay;
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
            });
            if (alive) requestAnimationFrame(frame);
            else canvas.remove();
        };
        requestAnimationFrame(frame);
    }, []);

    return { burst };
}