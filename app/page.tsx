"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  CirclePlus,
  Clock,
  Compass,
  Flame,
  Handshake,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import Hero from "@/components/Hero";
import ProblemCard, { StatusBadge } from "@/components/ProblemCard";
import TeamDots from "@/components/TeamDots";
import { PROBLEM_SELECT, filledOf, timeAgo } from "@/lib/problems";
import type { Problem } from "@/lib/problems";

type JoinRow = {
  created_at: string;
  user_id: string;
  profiles: { username: string } | null;
  problems: { id: number; title: string; author_id: string } | null;
};

type FeedEvent = {
  key: string;
  date: string;
  text: string;
  href: string;
  color: string;
};

const actions = [
  { href: "/new", label: "Muammo e’lon qilish", icon: CirclePlus, color: "#e548ff" },
  { href: "/problems", label: "Muammolarni ko’rish", icon: Compass, color: "#00d5ff" },
  { href: "/friends", label: "Do’stlarni topish", icon: Users, color: "#8b35ff" },
  { href: "/teams", label: "Jamoalarim", icon: Handshake, color: "#286bff" },
];

function Section({
  title,
  icon: Icon,
  color,
  href,
  children,
}: {
  title: string;
  icon: LucideIcon;
  color: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Icon size={18} style={{ color }} />
          {title}
        </h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-team hover:underline">
            Hammasi
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}

export default function Home() {
  const { user, loading } = useUser();
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [joins, setJoins] = useState<JoinRow[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    supabase
      .from("problems")
      .select(PROBLEM_SELECT)
      .order("created_at", { ascending: false })
      .limit(40)
      .then(({ data, error }) => {
        if (error) setLoadError(error.message);
        else setProblems(data as unknown as Problem[]);
      });

    supabase
      .from("team_members")
      .select("created_at,user_id,profiles(username),problems(id,title,author_id)")
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => setJoins((data ?? []) as unknown as JoinRow[]));
  }, []);

  const trending = useMemo(
    () => [...(problems ?? [])].sort((a, b) => filledOf(b) - filledOf(a)).slice(0, 4),
    [problems]
  );
  const recent = (problems ?? []).slice(0, 4);
  const activeTeams = (problems ?? [])
    .filter((p) => filledOf(p) >= 2 && p.status !== "completed")
    .slice(0, 4);

  const events = useMemo(() => {
    const list: FeedEvent[] = [];
    (problems ?? []).slice(0, 8).forEach((p) =>
      list.push({
        key: "p" + p.id,
        date: p.created_at,
        text: `${p.profiles?.username ?? "Kimdir"} muammo e’lon qildi: ${p.title}`,
        href: `/problems/${p.id}`,
        color: "#e548ff",
      })
    );
    joins.forEach((j) => {
      const pr = j.problems;
      if (!pr || j.user_id === pr.author_id) return; // muallifning o'z jamoasiga qo'shilishi yangilik emas
      list.push({
        key: "j" + j.user_id + pr.id,
        date: j.created_at,
        text: `${j.profiles?.username ?? "Kimdir"} jamoaga qo’shildi: ${pr.title}`,
        href: `/problems/${pr.id}`,
        color: "#00d5ff",
      });
    });
    return list
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [problems, joins]);

  const name = user?.email?.split("@")[0];
  const skeleton = (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl bg-panel/60" />
      ))}
    </div>
  );

  return (
    <main>
      {loading ? (
        <div className="h-44" />
      ) : user ? (
        <section className="mx-auto max-w-6xl px-5 pt-10">
          <div className="glass rounded-2xl p-7 sm:p-9">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              Xush kelibsiz, {name}.
            </h1>
            <p className="mt-3 max-w-xl text-mist">
              Muammolarni kashf eting. Odamlar bilan bog’laning. Yechimlar yarating.
            </p>
            <Link
              href="/new"
              className="mt-6 inline-block rounded-full bg-project px-7 py-3 font-semibold text-white transition hover:-translate-y-0.5"
            >
              Muammo e’lon qilish
            </Link>
          </div>
        </section>
      ) : (
        <Hero />
      )}

      <div className="mx-auto max-w-6xl px-5 pb-16">
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {actions.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="glass flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold transition hover:-translate-y-1 hover:border-project/60"
            >
              <Icon size={20} style={{ color }} />
              {label}
            </Link>
          ))}
        </div>

        {loadError && <p className="mt-8 text-problem">Xato: {loadError}</p>}

        {problems && problems.length === 0 && (
          <div className="glass mt-10 rounded-2xl p-8">
            <p className="text-mist">Hozircha muammo yo’q. Birinchi bo’ling!</p>
            <Link href="/new" className="mt-4 inline-block font-semibold text-team">
              Muammo e’lon qilish
            </Link>
          </div>
        )}

        <div className="mt-10 grid gap-10 xl:grid-cols-3">
          <div className="space-y-10 xl:col-span-2">
            <Section title="Mashhur muammolar" icon={Flame} color="#e548ff" href="/problems">
              {!problems ? (
                skeleton
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {trending.map((p) => (
                    <ProblemCard key={p.id} p={p} />
                  ))}
                </div>
              )}
            </Section>

            <Section title="Yangi e’lon qilinganlar" icon={Clock} color="#00d5ff" href="/problems">
              {!problems ? (
                skeleton
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {recent.map((p) => (
                    <ProblemCard key={p.id} p={p} />
                  ))}
                </div>
              )}
            </Section>
          </div>

          <div className="space-y-10">
            <Section title="Faol jamoalar" icon={Handshake} color="#8b35ff">
              {activeTeams.length === 0 ? (
                <p className="glass rounded-2xl p-5 text-sm text-mist">
                  Hali ikki va undan ortiq a’zoli jamoa yo’q. Muammoga qo’shilib,
                  birinchilardan bo’ling.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeTeams.map((p) => (
                    <Link
                      key={p.id}
                      href={`/problems/${p.id}`}
                      className="glass block rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-project/60"
                    >
                      <p className="text-sm font-semibold leading-snug">{p.title}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <TeamDots filled={filledOf(p)} total={p.team_size} />
                        <StatusBadge status={p.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Hamjamiyat faolligi" icon={Activity} color="#286bff">
              {events.length === 0 ? (
                <p className="glass rounded-2xl p-5 text-sm text-mist">
                  Hozircha yangilik yo’q.
                </p>
              ) : (
                <ul className="glass divide-y divide-line rounded-2xl">
                  {events.map((e) => (
                    <li key={e.key}>
                      <Link href={e.href} className="flex gap-3 p-4 transition hover:bg-white/5">
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: e.color }}
                        />
                        <span className="text-sm">
                          {e.text}
                          <span className="mt-1 block text-xs text-mist">
                            {timeAgo(e.date)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}
