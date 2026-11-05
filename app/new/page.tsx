"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import { categories } from "@/lib/problems";

const field =
  "w-full rounded-xl border border-line bg-panel px-4 py-3 text-snow outline-none transition placeholder:text-mist/60 focus:border-team focus:shadow-[0_0_0_3px_rgba(0,213,255,0.18)]";

export default function NewProblemPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [skillsText, setSkillsText] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setMessage("");

    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { data, error } = await supabase
      .from("problems")
      .insert({
        author_id: user.id,
        title,
        description,
        category,
        skills,
        team_size: teamSize,
      })
      .select("id")
      .single();

    if (error || !data) {
      setMessage("Xato: " + (error?.message ?? "noma’lum xato"));
      setBusy(false);
      return;
    }

    // Muallif avtomatik jamoaning birinchi a'zosi bo'ladi
    await supabase
      .from("team_members")
      .insert({ problem_id: data.id, user_id: user.id });

    router.push(`/problems/${data.id}`);
  }

  if (loading) return null;

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="font-display text-2xl font-bold">Muammo e’lon qilish</h1>
        <p className="mt-4 text-mist">
          Muammo e’lon qilish uchun hisob kerak. Saytni ko’rish esa hammaga ochiq.
        </p>
        <Link
          href="/login?next=/new"
          className="mt-6 inline-block rounded-full bg-team px-7 py-3 font-semibold text-night shadow-[0_0_28px_rgba(0,213,255,0.35)]"
        >
          Kirish yoki ro’yxatdan o’tish
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-bold">Muammo e’lon qilish</h1>
      <p className="mt-3 text-mist">
        Muammoni aniq tushuntiring, shunda to’g’ri odamlar jamoangizga qo’shiladi.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <input
          className={field}
          placeholder="Muammo nomi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className={`${field} min-h-40`}
          placeholder="Muammo nima, kimga ta’sir qiladi va nega muhim?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select
          className={field}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className={field}
          placeholder="Kerakli ko’nikmalar (vergul bilan: Python, Dizayn)"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
        />
        <label className="block text-sm text-mist">
          Jamoa hajmi (o’zingiz bilan birga)
          <input
            className={`${field} mt-2`}
            type="number"
            min={2}
            max={10}
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-problem px-8 py-3 font-semibold text-night shadow-[0_0_30px_rgba(229,72,255,0.35)] transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          {busy ? "Yuborilmoqda..." : "E’lon qilish"}
        </button>
        {message && <p className="text-sm text-problem">{message}</p>}
      </form>
    </main>
  );
}
