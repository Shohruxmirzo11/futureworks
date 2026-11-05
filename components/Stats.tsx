"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { supabase } from "@/lib/supabase";

function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    const node = ref.current;
    if (!inView || !node) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = Math.round(v).toString();
      },
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>0</span>;
}

const countOf = (table: string) =>
  supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .then(({ count }) => count ?? 0);

// Platforma raqamlarda: haqiqiy ma'lumotdan hisoblanadi
export default function Stats() {
  const [counts, setCounts] = useState<number[] | null>(null);

  useEffect(() => {
    Promise.all([countOf("problems"), countOf("profiles"), countOf("team_members")]).then(
      setCounts
    );
  }, []);

  const items = [
    { label: "E’lon qilingan muammolar", color: "#e548ff" },
    { label: "Ro’yxatdan o’tgan odamlar", color: "#00d5ff" },
    { label: "Jamoalardagi o’rinlar", color: "#8b35ff" },
  ];

  if (!counts) return null;

  return (
    <section className="mt-8 grid gap-3 sm:grid-cols-3">
      {items.map((it, i) => (
        <div key={it.label} className="glass rounded-2xl p-5">
          <p className="font-display text-3xl font-bold" style={{ color: it.color }}>
            <Count to={counts[i]} />
          </p>
          <p className="mt-1 text-sm text-mist">{it.label}</p>
        </div>
      ))}
    </section>
  );
}
