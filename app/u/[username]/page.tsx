"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import ProfileView from "@/components/ProfileView";
import { PROFILE_FIELDS } from "@/lib/profiles";
import type { Profile } from "@/lib/profiles";

function PublicProfileView() {
  const { username } = useParams<{ username: string }>();
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("username", username)
      .maybeSingle()
      .then(({ data }) => {
        setProfile((data as Profile | null) ?? null);
        setLoaded(true);
      });
  }, [username]);

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
        <p className="text-mist">Bunday foydalanuvchi topilmadi.</p>
        <Link href="/friends" className="mt-4 inline-block font-semibold text-team">
          Odamlarni qidirish
        </Link>
      </main>
    );
  }

  return (
    <ProfileView
      key={profile.id}
      profile={profile}
      isOwn={user?.id === profile.id}
    />
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-5 py-10">
          <div className="h-48 animate-pulse rounded-2xl bg-panel/60" />
        </main>
      }
    >
      <PublicProfileView />
    </Suspense>
  );
}
