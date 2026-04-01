"use client";
// BUG-02 FIX:
// 1. `activeCanvas` ref prevents multiple concurrent canvases from stacking
//    when the user rapidly submits the form.
// 2. A 3-second safety `setTimeout` removes the canvas if the tab is
//    backgrounded mid-animation (suspending requestAnimationFrame).
import { useCallback, useRef } from "react";

export function useParticleBurst() {
  const activeCanvas = useRef(null);

  const burst = useCallback((originEl) => {
    if (typeof window === "undefined") return;

    // Remove any stale canvas from a previous burst
    if (activeCanvas.current) {
      activeCanvas.current.remove();
      activeCanvas.current = null;
    }

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    activeCanvas.current = canvas;

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

    // Fallback: remove canvas after 3 s even if RAF is suspended (backgrounded tab)
    const safetyTimer = setTimeout(() => {
      canvas.remove();
      if (activeCanvas.current === canvas) activeCanvas.current = null;
    }, 3000);

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.4;
        p.life -= p.decay;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (alive) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
        if (activeCanvas.current === canvas) activeCanvas.current = null;
        clearTimeout(safetyTimer);
      }
    };

    requestAnimationFrame(frame);
  }, []);

  return { burst };
}