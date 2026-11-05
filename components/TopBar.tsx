"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";

export default function TopBar() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [q, setQ] = useState("");

  function search(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/problems?q=${encodeURIComponent(term)}` : "/problems");
  }

  const initial = (user?.email ?? "?")[0].toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-night/70 backdrop-blur-md">
      <div className="flex items-center gap-3 px-5 py-3">
        <Link
          href="/"
          className="font-display text-base font-bold tracking-tight lg:hidden"
        >
          FutureWorks
        </Link>

        <form onSubmit={search} className="relative ml-auto w-full max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Muammolarni qidirish"
            className="w-full rounded-full border border-line bg-panel/70 py-2 pl-10 pr-4 text-sm text-snow outline-none transition placeholder:text-mist/60 focus:border-team"
          />
        </form>

        {loading ? (
          <span className="h-9 w-20 shrink-0" />
        ) : user ? (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/profile"
              aria-label="Profil"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b35ff,#286bff)] text-sm font-bold"
            >
              {initial}
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              aria-label="Chiqish"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-mist transition hover:border-problem hover:text-problem"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/register"
              className="hidden rounded-full border border-project/70 px-5 py-2 text-sm font-semibold text-project transition hover:bg-project/10 sm:inline"
            >
              Ro’yxatdan o’tish
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-team px-5 py-2 text-sm font-semibold text-night transition hover:-translate-y-0.5"
            >
              Kirish
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
