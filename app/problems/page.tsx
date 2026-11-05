"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProblemCard from "@/components/ProblemCard";
import { PROBLEM_SELECT, categories, filledOf, statuses } from "@/lib/problems";
import type { Problem } from "@/lib/problems";

const field =
  "w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-snow outline-none transition placeholder:text-mist/60 focus:border-team";

function ProblemsView() {
  const params = useSearchParams();
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [skill, setSkill] = useState("");
  const [sort, setSort] = useState("new");

  // Yuqoridagi qidiruvdan kelgan so'zni qabul qilish
  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    supabase
      .from("problems")
      .select(PROBLEM_SELECT)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) setLoadError(error.message);
        else setProblems(data as unknown as Problem[]);
      });
  }, []);

  const shown = useMemo(() => {
    if (!problems) return [];
    const term = q.trim().toLowerCase();
    const sk = skill.trim().toLowerCase();
    const list = problems.filter(
      (p) =>
        (!term ||
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)) &&
        (!category || p.category === category) &&
        (!status || p.status === status) &&
        (!sk || (p.skills ?? []).some((s) => s.toLowerCase().includes(sk)))
    );
    if (sort === "popular") list.sort((a, b) => filledOf(b) - filledOf(a));
    return list;
  }, [problems, q, category, status, skill, sort]);

  function clearFilters() {
    setQ("");
    setCategory("");
    setStatus("");
    setSkill("");
    setSort("new");
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Muammolar</h1>
      <p className="mt-3 max-w-xl text-mist">
        Haqiqiy muammolarni toping va yechimini birga yaratadigan jamoaga qo’shiling.
      </p>

      <div className="glass mt-8 grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          className={`${field} lg:col-span-2`}
          placeholder="Nomi yoki tavsifi bo’yicha qidirish"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Barcha yo’nalishlar</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Barcha holatlar</option>
          {Object.entries(statuses).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
        <select className={field} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">Eng yangi</option>
          <option value="popular">Eng mashhur (a’zolar soni)</option>
        </select>
        <input
          className={`${field} sm:col-span-2 lg:col-span-2`}
          placeholder="Ko’nikma bo’yicha (masalan: Python)"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
      </div>

      <div className="mt-8">
        {loadError && <p className="text-problem">Xato: {loadError}</p>}

        {!problems && !loadError && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-panel/60" />
            ))}
          </div>
        )}

        {problems && (
          <>
            <p className="mb-4 text-sm text-mist">{shown.length} ta muammo topildi</p>
            {shown.length === 0 ? (
              <div className="glass rounded-2xl p-8">
                <p className="text-mist">Hech narsa topilmadi.</p>
                <div className="mt-4 flex flex-wrap gap-5">
                  <button onClick={clearFilters} className="font-semibold text-team">
                    Filtrlarni tozalash
                  </button>
                  <Link href="/new" className="font-semibold text-problem">
                    Yangi muammo e’lon qilish
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((p) => (
                  <ProblemCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <ProblemsView />
    </Suspense>
  );
}
