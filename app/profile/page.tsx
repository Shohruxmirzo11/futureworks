"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import ProfileView from "@/components/ProfileView";
import { PROFILE_FIELDS } from "@/lib/profiles";
import type { Profile } from "@/lib/profiles";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile((data as Profile | null) ?? null);
        setLoaded(true);
      });
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="font-display text-2xl font-bold">Profil</h1>
        <p className="mt-4 text-mist">
          O’z profilingizni ko’rish uchun hisob kerak. Boshqalarning profillarini
          esa hisobsiz ham ko’rish mumkin.
        </p>
        <Link
          href="/login?next=/profile"
          className="mt-6 inline-block rounded-full bg-team px-7 py-3 font-semibold text-night"
        >
          Kirish yoki ro’yxatdan o’tish
        </Link>
      </main>
    );
  }

  if (!loaded) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="h-48 animate-pulse rounded-2xl bg-panel/60" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <p className="text-mist">
          Profil topilmadi. Supabase’da Table Editor → profiles jadvalida
          qatoringiz borligini tekshiring.
        </p>
      </main>
    );
  }

  return <ProfileView key={profile.id} profile={profile} isOwn />;
}
