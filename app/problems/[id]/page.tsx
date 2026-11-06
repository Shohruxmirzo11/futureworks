"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import TeamDots from "@/components/TeamDots";
import { StatusBadge } from "@/components/ProblemCard";
import { statuses } from "@/lib/problems";

type Member = { user_id: string; profiles: { username: string } | null };

type Problem = {
  id: number;
  author_id: string;
  title: string;
  description: string;
  category: string;
  skills: string[] | null;
  team_size: number;
  status: string;
  team_members: Member[];
};

function ProblemView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("problems")
      .select(
        "id,author_id,title,description,category,skills,team_size,status,team_members(user_id,profiles(username))"
      )
      .eq("id", id)
      .maybeSingle();
    if (error) setMessage("Xato: " + error.message);
    setProblem((data as unknown as Problem | null) ?? null);
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function join() {
    // Kirmagan bo'lsa, kirish sahifasiga yuboramiz va keyin shu yerga qaytaramiz
    if (!user) {
      router.push(`/login?next=/problems/${id}`);
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await supabase
      .from("team_members")
      .insert({ problem_id: Number(id), user_id: user.id });
    setBusy(false);
    if (error) setMessage("Xato: " + error.message);
    else await load();
  }

  async function leave() {
    if (!user) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("problem_id", Number(id))
      .eq("user_id", user.id);
    setBusy(false);
    if (error) setMessage("Xato: " + error.message);
    else await load();
  }

  async function changeStatus(status: string) {
    setMessage("");
    const { error } = await supabase.from("problems").update({ status }).eq("id", id);
    if (error) setMessage("Xato: " + error.message);
    else await load();
  }

  if (!loaded) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <div className="h-40 animate-pulse rounded-2xl bg-panel/60" />
      </main>
    );
  }

  if (!problem) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-mist">Bunday muammo topilmadi.</p>
        {message && <p className="mt-2 text-sm text-problem">{message}</p>}
        <Link href="/" className="mt-4 inline-block font-semibold text-team">
          Bosh sahifaga qaytish
        </Link>
      </main>
    );
  }

  const members = problem.team_members ?? [];
  const isMember = !!user && members.some((m) => m.user_id === user.id);
  const full = members.length >= problem.team_size;

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <Link href="/problems" className="text-sm text-mist transition hover:text-team">
        Barcha muammolar
      </Link>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-problem">{problem.category}</p>
        <StatusBadge status={problem.status} />
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
        {problem.title}
      </h1>
      <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-snow/85">
        {problem.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(problem.skills ?? []).map((s) => (
          <span
            key={s}
            className="rounded-full border border-line px-3 py-1 text-sm text-mist"
          >
            {s}
          </span>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 rounded-2xl border border-team/40 bg-panel/70 p-6 shadow-[0_0_40px_rgba(0,213,255,0.08)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold">Jamoa</h2>
            <p className="mt-1 text-sm text-mist">
              {members.length} / {problem.team_size} o’rin to’lgan
            </p>
          </div>
          <TeamDots filled={members.length} total={problem.team_size} />
        </div>

        <ul className="mt-5 flex flex-wrap gap-2">
          {members.map((m) => (
            <li key={m.user_id}>
              <Link
                href={`/u/${m.profiles?.username ?? ""}`}
                className="block rounded-full border border-line px-3 py-1 text-sm transition hover:border-team hover:text-team"
              >
                {m.profiles?.username ?? "Ishtirokchi"}
                {m.user_id === problem.author_id ? " (rahbar)" : ""}
              </Link>
            </li>
          ))}
        </ul>

        {user?.id === problem.author_id && (
          <label className="mt-6 block text-sm text-mist">
            Loyiha holati (faqat rahbar o’zgartiradi)
            <select
              className="mt-2 w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-snow outline-none focus:border-team"
              value={problem.status}
              onChange={(e) => changeStatus(e.target.value)}
            >
              {Object.entries(statuses).map(([key, st]) => (
                <option key={key} value={key}>
                  {st.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="mt-6">
          {isMember ? (
            <button
              onClick={leave}
              disabled={busy}
              className="rounded-full border border-problem/60 px-6 py-3 font-semibold text-problem transition hover:bg-problem/10 disabled:opacity-50"
            >
              Jamoadan chiqish
            </button>
          ) : (
            <button
              onClick={join}
              disabled={busy || full}
              className="rounded-full bg-team px-7 py-3 font-semibold text-night shadow-[0_0_28px_rgba(0,213,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(0,213,255,0.59)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {full ? "Jamoa to’lgan" : "Jamoaga qo’shilish"}
            </button>
          )}

          {!user && !isMember && (
            <p className="mt-3 text-sm text-mist">
              Qo’shilish uchun kirish kerak. Tugmani bossangiz, kirish sahifasiga
              o’tasiz va keyin shu yerga qaytasiz.
            </p>
          )}
          {message && <p className="mt-3 text-sm text-problem">{message}</p>}
        </div>
      </motion.section>
    </main>
  );
}

export default function ProblemPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-5 py-16">
          <div className="h-40 animate-pulse rounded-2xl bg-panel/60" />
        </main>
      }
    >
      <ProblemView />
    </Suspense>
  );
}
