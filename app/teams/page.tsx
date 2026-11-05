"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import TeamDots from "@/components/TeamDots";
import { StatusBadge } from "@/components/ProblemCard";
import { PROBLEM_SELECT, filledOf } from "@/lib/problems";
import type { Problem } from "@/lib/problems";

export default function TeamsPage() {
  const { user, loading } = useUser();
  const [teams, setTeams] = useState<Problem[] | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("team_members")
      .select(`problems(${PROBLEM_SELECT})`)
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error) {
          setLoadError(error.message);
          return;
        }
        const rows = (data ?? []) as unknown as { problems: Problem | null }[];
        setTeams(
          rows
            .map((r) => r.problems)
            .filter((p): p is Problem => !!p)
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
        );
      });
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="font-display text-2xl font-bold">Jamoalarim</h1>
        <p className="mt-4 text-mist">
          Jamoalaringizni ko’rish uchun hisob kerak. Muammolar va jamoalarni esa
          hisobsiz ham ko’rishingiz mumkin.
        </p>
        <Link
          href="/login?next=/teams"
          className="mt-6 inline-block rounded-full bg-team px-7 py-3 font-semibold text-night"
        >
          Kirish yoki ro’yxatdan o’tish
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Jamoalarim</h1>
      <p className="mt-3 max-w-xl text-mist">
        Siz rahbar yoki a’zo bo’lgan jamoalar. Jamoaga kirish uchun ustiga bosing.
      </p>

      {loadError && <p className="mt-6 text-problem">Xato: {loadError}</p>}

      <div className="mt-8">
        {teams === null && !loadError && (
          <div className="h-40 animate-pulse rounded-2xl bg-panel/60" />
        )}

        {teams && teams.length === 0 && (
          <div className="glass rounded-2xl p-8">
            <p className="text-mist">Hali birorta jamoada emassiz.</p>
            <div className="mt-4 flex flex-wrap gap-5">
              <Link href="/problems" className="font-semibold text-team">
                Muammolarni ko’rish
              </Link>
              <Link href="/new" className="font-semibold text-problem">
                Yangi muammo e’lon qilish
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {teams?.map((p) => {
            const leader = p.author_id === user.id;
            const filled = filledOf(p);
            return (
              <Link
                key={p.id}
                href={`/problems/${p.id}`}
                className="glass group flex flex-col rounded-2xl p-5 transition hover:-translate-y-1 hover:border-project/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      background: leader ? "rgba(139,53,255,0.2)" : "rgba(0,213,255,0.12)",
                      color: leader ? "#b98cff" : "#00d5ff",
                    }}
                  >
                    {leader ? "Rahbar" : "A’zo"}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <h2 className="mt-3 font-display text-base font-bold leading-snug transition group-hover:text-team">
                  {p.title}
                </h2>
                <p className="mt-1 text-xs text-mist">
                  {p.category} · Rahbar: {p.profiles?.username ?? "noma’lum"}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 text-xs text-mist">
                  <TeamDots filled={filled} total={p.team_size} />
                  <span>
                    {filled}/{p.team_size} a’zo
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
