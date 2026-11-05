"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import TeamDots from "@/components/TeamDots";

type Problem = {
  id: number;
  title: string;
  description: string;
  category: string;
  skills: string[] | null;
  team_size: number;
  team_members: { count: number }[];
};

export default function ProblemList() {
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    supabase
      .from("problems")
      .select(
        "id,title,description,category,skills,team_size,team_members(count)"
      )
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setLoadError(error.message);
        else setProblems(data as unknown as Problem[]);
      });
  }, []);

  return (
    <section id="muammolar" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-28">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">
        Dolzarb muammolar
      </h2>
      <p className="mt-3 max-w-xl text-mist">
        Hammasini kirmasdan ko’ring. Jamoaga qo’shilish uchun hisob kerak bo’ladi.
      </p>

      <div className="mt-10 space-y-4">
        {loadError && <p className="text-problem">Xato: {loadError}</p>}

        {!problems && !loadError &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-panel/60" />
          ))}

        {problems && problems.length === 0 && (
          <div className="rounded-2xl border border-line bg-panel/60 p-8">
            <p className="text-mist">Hozircha muammo yo’q. Birinchi bo’ling!</p>
            <Link href="/new" className="mt-4 inline-block font-semibold text-team">
              Muammo e’lon qilish
            </Link>
          </div>
        )}

        {problems?.map((p, i) => {
          const filled = p.team_members?.[0]?.count ?? 0;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.06 }}
            >
              <Link
                href={`/problems/${p.id}`}
                className="group block rounded-2xl border border-line bg-panel/60 p-5 transition hover:-translate-y-1 hover:border-problem/60 hover:shadow-[0_0_36px_rgba(255,61,129,0.22)] sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold text-problem">
                      {p.category}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold leading-snug transition group-hover:text-problem">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-mist">
                      {p.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(p.skills ?? []).map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-line px-3 py-1 text-xs text-mist"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    <TeamDots filled={filled} total={p.team_size} />
                    <span className="text-sm font-semibold text-team">
                      {filled}/{p.team_size} o’rin to’lgan
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
