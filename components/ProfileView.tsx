"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Avatar from "@/components/Avatar";
import FriendButton from "@/components/FriendButton";
import ProblemCard from "@/components/ProblemCard";
import { PROBLEM_SELECT } from "@/lib/problems";
import type { Problem } from "@/lib/problems";
import { PROFILE_FIELDS, splitList } from "@/lib/profiles";
import type { Profile } from "@/lib/profiles";

const field =
  "w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-snow outline-none transition placeholder:text-mist/60 focus:border-team";

function Chips({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span
          key={s}
          className="rounded-full border px-3 py-1 text-sm"
          style={{ borderColor: color + "66", color }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export default function ProfileView({
  profile: initial,
  isOwn,
}: {
  profile: Profile;
  isOwn: boolean;
}) {
  const [profile, setProfile] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [published, setPublished] = useState<Problem[] | null>(null);
  const [teams, setTeams] = useState<Problem[] | null>(null);
  const [friendCount, setFriendCount] = useState<number | null>(null);

  const [fullName, setFullName] = useState(initial.full_name ?? "");
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [skillsText, setSkillsText] = useState((initial.skills ?? []).join(", "));
  const [interestsText, setInterestsText] = useState(
    (initial.interests ?? []).join(", ")
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase
      .from("problems")
      .select(PROBLEM_SELECT)
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPublished((data ?? []) as unknown as Problem[]));

    supabase
      .from("team_members")
      .select(`problems(${PROBLEM_SELECT})`)
      .eq("user_id", profile.id)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as { problems: Problem | null }[];
        setTeams(
          rows
            .map((r) => r.problems)
            .filter((p): p is Problem => !!p && p.author_id !== profile.id)
        );
      });

    if (isOwn) {
      supabase
        .from("friendships")
        .select("id", { count: "exact", head: true })
        .eq("status", "accepted")
        .then(({ count }) => setFriendCount(count ?? 0));
    }
  }, [profile.id, isOwn]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const uname = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(uname)) {
      setMessage(
        "Username 3 dan 20 gacha belgi bo’lsin: kichik lotin harflari, raqamlar va pastki chiziq (_)."
      );
      return;
    }
    setBusy(true);
    setMessage("");
    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: uname,
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        skills: splitList(skillsText),
        interests: splitList(interestsText),
      })
      .eq("id", profile.id)
      .select(PROFILE_FIELDS)
      .single();
    setBusy(false);
    if (error) {
      setMessage(
        error.code === "23505"
          ? "Bu username band, boshqasini tanlang."
          : "Xato: " + error.message
      );
      return;
    }
    setProfile(data as Profile);
    setEditing(false);
  }

  const displayName = profile.full_name || profile.username;
  const skills = profile.skills ?? [];
  const interests = profile.interests ?? [];

  const stats: { label: string; value: number | string }[] = [
    { label: "E’lon qilgan muammolar", value: published?.length ?? "–" },
    { label: "Qo’shilgan jamoalar", value: teams?.length ?? "–" },
  ];
  if (isOwn) stats.push({ label: "Do’stlar", value: friendCount ?? "–" });

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <section className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={displayName} size={84} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-bold">{displayName}</h1>
            <p className="mt-1 text-sm text-team">@{profile.username}</p>
            {profile.bio && <p className="mt-3 max-w-2xl text-mist">{profile.bio}</p>}
          </div>
          <div className="shrink-0">
            {isOwn ? (
              <button
                onClick={() => setEditing(!editing)}
                className="rounded-full border border-project/70 px-5 py-2.5 text-sm font-semibold text-project transition hover:bg-project/10"
              >
                {editing ? "Bekor qilish" : "Profilni tahrirlash"}
              </button>
            ) : (
              <FriendButton otherId={profile.id} username={profile.username} />
            )}
          </div>
        </div>
      </section>

      {editing && (
        <form onSubmit={save} className="glass mt-6 space-y-4 rounded-2xl p-6">
          <label className="block text-sm text-mist">
            To’liq ism
            <input className={`${field} mt-2`} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label className="block text-sm text-mist">
            Username
            <input className={`${field} mt-2`} value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="block text-sm text-mist">
            Qisqa tanishtiruv
            <textarea className={`${field} mt-2 min-h-24`} value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
          <label className="block text-sm text-mist">
            Ko’nikmalar (vergul bilan)
            <input
              className={`${field} mt-2`}
              placeholder="Python, Dizayn, Elektronika"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
            />
          </label>
          <label className="block text-sm text-mist">
            Qiziqishlar (vergul bilan)
            <input
              className={`${field} mt-2`}
              placeholder="Robototexnika, Ekologiya"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-project px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {busy ? "Saqlanmoqda..." : "Saqlash"}
          </button>
          {message && <p className="text-sm text-problem">{message}</p>}
        </form>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-sm text-mist">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-lg font-bold">Ko’nikmalar</h2>
          {skills.length > 0 ? (
            <Chips items={skills} color="#8b35ff" />
          ) : (
            <p className="text-sm text-mist">
              {isOwn ? "Ko’nikmalaringizni qo’shing: shunda jamoalar sizni tezroq topadi." : "Ko’nikmalar ko’rsatilmagan."}
            </p>
          )}
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-bold">Qiziqishlar</h2>
          {interests.length > 0 ? (
            <Chips items={interests} color="#00d5ff" />
          ) : (
            <p className="text-sm text-mist">
              {isOwn ? "Qiziqishlaringizni qo’shing." : "Qiziqishlar ko’rsatilmagan."}
            </p>
          )}
        </section>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 font-display text-lg font-bold">E’lon qilingan muammolar</h2>
        {published === null ? (
          <div className="h-40 animate-pulse rounded-2xl bg-panel/60" />
        ) : published.length === 0 ? (
          <p className="text-sm text-mist">
            {isOwn ? "Hali muammo e’lon qilmagansiz. " : "Hozircha muammo e’lon qilmagan. "}
            {isOwn && (
              <Link href="/new" className="font-semibold text-team">
                Birinchisini e’lon qiling
              </Link>
            )}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {published.map((p) => (
              <ProblemCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 font-display text-lg font-bold">Qo’shilgan jamoalar</h2>
        {teams === null ? (
          <div className="h-40 animate-pulse rounded-2xl bg-panel/60" />
        ) : teams.length === 0 ? (
          <p className="text-sm text-mist">
            Hozircha boshqa jamoaga qo’shilmagan.{" "}
            {isOwn && (
              <Link href="/problems" className="font-semibold text-team">
                Muammolarni ko’rish
              </Link>
            )}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {teams.map((p) => (
              <ProblemCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
