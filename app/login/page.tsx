"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const field =
  "w-full rounded-xl border border-line bg-panel px-4 py-3 text-snow outline-none transition placeholder:text-mist/60 focus:border-team focus:shadow-[0_0_0_3px_rgba(0,213,255,0.18)]";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Kirgandan keyin avvalgi sahifaga qaytaradi (?next=...)
  function goNext() {
    const next = new URLSearchParams(window.location.search).get("next") || "/";
    router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/");
  }

  async function signIn() {
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMessage("Xato: " + error.message);
    else goNext();
  }

  async function signUp() {
    setBusy(true);
    setMessage("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) setMessage("Xato: " + error.message);
    else if (data.session) goNext();
    else setMessage("Emailingizga tasdiqlash xati yuborildi.");
  }

  return (
    <main className="mx-auto max-w-sm px-5 py-16">
      <h1 className="font-display text-2xl font-bold">Kirish</h1>
      <p className="mt-3 text-sm text-mist">
        Saytni ko’rish uchun hisob kerak emas. Hisob jamoaga qo’shilish va muammo
        e’lon qilish uchun kerak.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          signIn();
        }}
      >
        <input
          className={field}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={field}
          type="password"
          placeholder="Parol (kamida 6 belgi)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-full bg-team px-5 py-3 font-semibold text-night shadow-[0_0_24px_rgba(0,213,255,0.32)] transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={signUp}
            disabled={busy}
            className="flex-1 rounded-full border border-project/70 px-5 py-3 font-semibold text-project transition hover:bg-project/10 disabled:opacity-50"
          >
            Ro’yxatdan o’tish
          </button>
        </div>
        {message && <p className="text-sm text-mist">{message}</p>}
      </form>
    </main>
  );
}
