"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";

const field =
  "w-full rounded-xl border border-line bg-panel px-4 py-3 text-snow outline-none transition placeholder:text-mist/60 focus:border-team focus:shadow-[0_0_0_3px_rgba(0,213,255,0.18)]";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(window.location.search);
  }, []);

  function goNext() {
    const next = new URLSearchParams(window.location.search).get("next") || "/";
    router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const raw = identifier.trim();
    const id = raw.toLowerCase(); // faqat email uchun
    setBusy(true);
    setMessage("");

    if (id.includes("@")) {
      const { error } = await supabase.auth.signInWithPassword({ email: id, password });
      setBusy(false);
      if (error) setMessage("Email yoki parol noto’g’ri.");
      else goNext();
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: raw, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBusy(false);
        setMessage(json.error ?? "Kirib bo’lmadi.");
        return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: json.access_token,
        refresh_token: json.refresh_token,
      });
      setBusy(false);
      if (error) setMessage("Xato: " + error.message);
      else goNext();
    } catch {
      setBusy(false);
      setMessage("Tarmoq xatosi. Qayta urinib ko’ring.");
    }
  }

  return (
    <AuthShell
      title="Kirish"
      subtitle="Nik va parolingiz bilan kiring. Saytni ko’rish uchun hisob shart emas."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm text-mist">
          Nik
          <input
            className={`${field} mt-2`}
            placeholder="masalan: ali_dev"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="block text-sm text-mist">
          Parol
          <div className="mt-2">
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Parolingiz"
              autoComplete="current-password"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-team px-6 py-3 font-semibold text-night transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          {busy ? "Kirilmoqda..." : "Kirish"}
        </button>
        {message && <p className="text-sm text-problem">{message}</p>}
      </form>

      <p className="mt-6 text-sm text-mist">
        Hisobingiz yo’qmi?{" "}
        <Link href={`/register${search}`} className="font-semibold text-project">
          Ro’yxatdan o’ting
        </Link>
      </p>
    </AuthShell>
  );
}
