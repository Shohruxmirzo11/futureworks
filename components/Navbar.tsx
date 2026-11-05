"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";

export default function Navbar() {
  const { user, loading } = useUser();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-night/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-base font-bold tracking-tight"
        >
          <span className="h-3 w-3 rounded-full bg-[linear-gradient(135deg,#ff3d81,#8b5cff,#22e1ff)] shadow-[0_0_14px_rgba(139,92,255,0.9)]" />
          FutureWorks
        </Link>

        <div className="flex items-center gap-5 text-sm font-semibold sm:gap-7">
          <Link
            href="/#muammolar"
            className="hidden text-mist transition hover:text-problem sm:inline"
          >
            Muammolar
          </Link>
          <Link
            href="/new"
            className="hidden text-mist transition hover:text-project sm:inline"
          >
            E’lon berish
          </Link>

          {loading ? (
            <span className="h-9 w-20" />
          ) : user ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-mist sm:inline">
                {user.email?.split("@")[0]}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="rounded-full border border-line px-4 py-2 text-snow transition hover:border-problem hover:text-problem"
              >
                Chiqish
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-team px-5 py-2 text-night shadow-[0_0_24px_rgba(34,225,255,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(34,225,255,0.8)]"
            >
              Kirish
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
