"use client";

import { useEffect } from "react";

// Sichqoncha kartalar ustida yurganda, shu karta ichida yorug'lik ergashadi
export default function CardSpotlight() {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target as Element | null;
      const card = target?.closest<HTMLElement>(".glass");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", move, { passive: true });
    return () => document.removeEventListener("pointermove", move);
  }, []);

  return null;
}
