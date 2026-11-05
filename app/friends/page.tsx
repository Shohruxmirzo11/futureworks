"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import Avatar from "@/components/Avatar";
import { PROFILE_FIELDS } from "@/lib/profiles";
import type { Profile } from "@/lib/profiles";

type Mini = {
  id: string;
  username: string;
  full_name: string | null;
  skills: string[] | null;
};

type Row = {
  id: number;
  requester_id: string;
  addressee_id: string;
  status: string;
  requester: Mini | null;
  addressee: Mini | null;
};

type Tab = "friends" | "requests" | "find";

const field =
  "w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-snow outline-none transition placeholder:text-mist/60 focus:border-team";
const primary =
  "rounded-full bg-team px-4 py-2 text-sm font-semibold text-night transition hover:-translate-y-0.5 disabled:opacity-50";
const ghost =
  "rounded-full border border-line px-4 py-2 text-sm font-semibold text-mist transition hover:border-problem hover:text-problem disabled:opacity-50";

function PersonRow({
  person,
  children,
}: {
  person: Mini | null;
  children?: React.ReactNode;
}) {
  if (!person) return null;
  const name = person.full_name || person.username;
  return (
    <li className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4">
      <Link href={`/u/${person.username}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={name} size={44} />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{name}</span>
          <span className="block truncate text-xs text-team">@{person.username}</span>
          {(person.skills ?? []).length > 0 && (
            <span className="mt-1 block truncate text-xs text-mist">
              {(person.skills ?? []).slice(0, 4).join(" · ")}
            </span>
          )}
        </span>
      </Link>
      <div className="flex gap-2">{children}</div>
    </li>
  );
}

export default function FriendsPage() {
  const { user, loading } = useUser();
  const [tab, setTab] = useState<Tab | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [people, setPeople] = useState<Profile[] | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadRows = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("friendships")
      .select(
        "id,requester_id,addressee_id,status,requester:profiles!requester_id(id,username,full_name,skills),addressee:profiles!addressee_id(id,username,full_name,skills)"
      )
      .order("created_at", { ascending: false });
    if (error) setMessage("Xato: " + error.message);
    else setRows((data ?? []) as unknown as Row[]);
  }, [user]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => setPeople((data ?? []) as unknown as Profile[]));
  }, []);

  async function act(
    action: () => PromiseLike<{ error: { message: string } | null }>
  ) {
    setBusy(true);
    setMessage("");
    const { error } = await action();
    setBusy(false);
    if (error) setMessage("Xato: " + error.message);
    else await loadRows();
  }

  const me = user?.id;
  const friends = rows.filter((r) => r.status === "accepted");
  const incoming = rows.filter((r) => r.status === "pending" && r.addressee_id === me);
  const outgoing = rows.filter((r) => r.status === "pending" && r.requester_id === me);

  const found = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (people ?? []).filter((p) => {
      if (p.id === me) return false;
      if (!term) return true;
      const hay = [p.username, p.full_name ?? "", ...(p.skills ?? []), ...(p.interests ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [people, q, me]);

  if (loading) return null;

  const active: Tab = tab ?? (user ? "friends" : "find");
  const tabs: { key: Tab; label: string; count?: number }[] = [
    ...(user
      ? [
          { key: "friends" as Tab, label: "Do’stlarim", count: friends.length },
          { key: "requests" as Tab, label: "So’rovlar", count: incoming.length + outgoing.length },
        ]
      : []),
    { key: "find", label: "Odamlarni topish" },
  ];

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Do’stlar</h1>
      <p className="mt-3 text-mist">
        Ko’nikmalari mos odamlarni toping va jamoa yig’ishda ulardan foydalaning.
      </p>

      {!user && (
        <p className="glass mt-6 rounded-2xl p-4 text-sm text-mist">
          Odamlarni ko’rish hammaga ochiq. Do’st qo’shish uchun{" "}
          <Link href="/login?next=/friends" className="font-semibold text-team">
            kiring
          </Link>
          .
        </p>
      )}

      <div className="mt-8 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
              active === t.key
                ? "bg-project/20 text-snow shadow-[inset_0_0_0_1px_rgba(139,53,255,0.5)]"
                : "text-mist hover:text-snow"
            }`}
          >
            {t.label}
            {t.count ? <span className="ml-2 text-team">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-problem">{message}</p>}

      <div className="mt-6">
        {active === "friends" && (
          <ul className="space-y-3">
            {friends.length === 0 && (
              <p className="text-sm text-mist">
                Hali do’stingiz yo’q. “Odamlarni topish” bo’limidan boshlang.
              </p>
            )}
            {friends.map((r) => (
              <PersonRow key={r.id} person={r.requester_id === me ? r.addressee : r.requester}>
                <button
                  disabled={busy}
                  onClick={() => act(() => supabase.from("friendships").delete().eq("id", r.id))}
                  className={ghost}
                >
                  Tugatish
                </button>
              </PersonRow>
            ))}
          </ul>
        )}

        {active === "requests" && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 font-display text-base font-bold">Kelgan so’rovlar</h2>
              <ul className="space-y-3">
                {incoming.length === 0 && <p className="text-sm text-mist">Kelgan so’rov yo’q.</p>}
                {incoming.map((r) => (
                  <PersonRow key={r.id} person={r.requester}>
                    <button
                      disabled={busy}
                      onClick={() =>
                        act(() =>
                          supabase.from("friendships").update({ status: "accepted" }).eq("id", r.id)
                        )
                      }
                      className={primary}
                    >
                      Qabul qilish
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => act(() => supabase.from("friendships").delete().eq("id", r.id))}
                      className={ghost}
                    >
                      Rad etish
                    </button>
                  </PersonRow>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="mb-3 font-display text-base font-bold">Yuborilgan so’rovlar</h2>
              <ul className="space-y-3">
                {outgoing.length === 0 && <p className="text-sm text-mist">Yuborilgan so’rov yo’q.</p>}
                {outgoing.map((r) => (
                  <PersonRow key={r.id} person={r.addressee}>
                    <button
                      disabled={busy}
                      onClick={() => act(() => supabase.from("friendships").delete().eq("id", r.id))}
                      className={ghost}
                    >
                      Bekor qilish
                    </button>
                  </PersonRow>
                ))}
              </ul>
            </section>
          </div>
        )}

        {active === "find" && (
          <div>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist"
              />
              <input
                className={`${field} pl-10`}
                placeholder="Ism, username, ko’nikma yoki qiziqish bo’yicha"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <ul className="mt-5 space-y-3">
              {people === null && <div className="h-24 animate-pulse rounded-2xl bg-panel/60" />}
              {people && found.length === 0 && (
                <p className="text-sm text-mist">Hech kim topilmadi.</p>
              )}
              {found.map((p) => (
                <PersonRow key={p.id} person={p} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
