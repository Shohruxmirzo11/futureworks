"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// Kursor ortidan yuruvchi yorug'lik (faqat sichqonchali qurilmalarda)
export default function CursorGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 120, damping: 20 });
  const sy = useSpring(y, { stiffness: 120, damping: 20 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;

    setEnabled(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX - 200);
      y.set(e.clientY - 200);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,53,255,0.28),transparent_65%)]"
    />
  );
}
