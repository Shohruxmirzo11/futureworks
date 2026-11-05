"use client";

import { useEffect, useRef } from "react";

// Fon: nurli "tarmoq". Nuqtalar sekin suzadi, yaqinlari chiziq bilan ulanadi,
// sichqoncha esa o'zi ham tugun bo'lib atrofidagi nuqtalarni o'ziga ulaydi.
// Ya'ni odamlar va g'oyalar bir-biriga ulanayotgandek: saytning o'z ma'nosi.
const COLORS = ["229,72,255", "0,213,255", "139,53,255", "40,107,255"];
const LINK = 130; // nuqtalar orasidagi ulanish masofasi
const CURSOR_LINK = 180; // sichqoncha ulanish masofasi

type Particle = { x: number; y: number; vx: number; vy: number; r: number; c: string };

export default function NetworkBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -9999, y: -9999 };
    let w = 0;
    let h = 0;
    let raf = 0;
    let particles: Particle[] = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.floor((w * h) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.4 + 0.8,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    }

    function frame() {
      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // sichqoncha yaqinidagi nuqtalar unga sekin tortiladi
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        if (dx * dx + dy * dy < CURSOR_LINK * CURSOR_LINK) {
          p.x += dx * 0.004;
          p.y += dy * 0.004;
        }
      }

      ctx!.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx!.strokeStyle = `rgba(${a.c},${(1 - d / LINK) * 0.28})`;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < CURSOR_LINK) {
          ctx!.strokeStyle = `rgba(0,213,255,${(1 - dm / CURSOR_LINK) * 0.6})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.stroke();
        }
      }

      for (const p of particles) {
        ctx!.fillStyle = `rgba(${p.c},0.85)`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (!calm) raf = requestAnimationFrame(frame);
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !calm) raf = requestAnimationFrame(frame);
    };

    resize();
    frame();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
