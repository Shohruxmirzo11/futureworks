"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";
import {
  isValidEmail,
  isValidPhone,
  isValidUsername,
  normalizePhone,
  regions,
} from "@/lib/regions";

type NickState = "idle" | "invalid" | "checking" | "free" | "taken";

const field =
  "w-full rounded-xl border border-line bg-panel px-4 py-3 text-snow outline-none transition placeholder:text-mist/60 focus:border-team focus:shadow-[0_0_0_3px_rgba(0,213,255,0.18)]";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [agree, setAgree] = useState(false);
  const [nick, setNick] = useState<NickState>("idle");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(window.location.search);
  }, []);

  // Nik bo'shligini yozish paytida tekshirib turadi
  useEffect(() => {
    if (!username) {
      setNick("idle");
      return;
    }
    if (!isValidUsername(username)) {
      setNick("invalid");
      return;
    }
    setNick("checking");
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc("username_available", {
        uname: username,
      });
      if (cancelled) return;
      setNick(error ? "idle" : data ? "free" : "taken");
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [username]);

  function goNext() {
    const next = new URLSearchParams(window.location.search).get("next") || "/";
    router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const mail = email.trim().toLowerCase();

    if (fullName.trim().length < 3) return setMessage("Ism va familiyangizni kiriting.");
    if (!isValidUsername(username))
      return setMessage("Nik 3–20 belgi bo’lsin: lotin harflari, raqamlar va _ .");
    if (nick === "taken") return setMessage("Bu nik band, boshqasini tanlang.");
    if (!isValidEmail(mail)) return setMessage("Email manzilini to’g’ri kiriting.");
    if (!isValidPhone(phone))
      return setMessage("Telefon raqamini to’g’ri kiriting (masalan: +998 90 123 45 67).");
    if (!region) return setMessage("Viloyatingizni tanlang.");
    if (district.trim().length < 2) return setMessage("Shahar yoki tumaningizni kiriting.");
    if (birthDate && new Date(birthDate) > new Date())
      return setMessage("Tug’ilgan sana kelajakda bo’lishi mumkin emas.");
    if (password.length < 8) return setMessage("Parol kamida 8 belgi bo’lsin.");
    if (password !== password2) return setMessage("Parollar bir xil emas.");
    if (!agree) return setMessage("Davom etish uchun qoidalarga rozilik bering.");

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: mail,
      password,
      options: {
        data: {
          username,
          full_name: fullName.trim(),
          phone: normalizePhone(phone),
          region,
          district: district.trim(),
          address: address.trim(),
          birth_date: birthDate,
        },
      },
    });
    setBusy(false);

    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("already registered")) setMessage("Bu email bilan hisob allaqachon mavjud.");
      else if (m.includes("database error"))
        setMessage("Ma’lumotlarni saqlab bo’lmadi. Nik band bo’lishi mumkin, boshqasini tanlang.");
      else setMessage("Xato: " + error.message);
      return;
    }

    // Email band bo'lsa, Supabase bo'sh "identities" qaytaradi
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setMessage("Bu email bilan hisob allaqachon mavjud.");
      return;
    }

    if (data.session) goNext();
    else setDone(true);
  }

  if (done) {
    return (
      <AuthShell
        title="Emailingizni tasdiqlang"
        subtitle={`${email.trim()} manziliga xat yubordik. Xatdagi havolani bosing, keyin nik va parolingiz bilan kiring.`}
      >
        <Link
          href={`/login${search}`}
          className="inline-block rounded-full bg-team px-7 py-3 font-semibold text-night"
        >
          Kirish sahifasiga o’tish
        </Link>
      </AuthShell>
    );
  }

  const nickHint = {
    idle: "Lotin harflari, raqamlar va _ (3–20 belgi). Email bo’la olmaydi. Katta-kichik harf farqlanadi: Ali va ali boshqa-boshqa nik.",
    invalid: "Faqat lotin harflari, raqamlar va _ (3–20 belgi).",
    checking: "Tekshirilmoqda...",
    free: "Bu nik bo’sh.",
    taken: "Bu nik band.",
  }[nick];
  const nickColor =
    nick === "free" ? "text-team" : nick === "taken" || nick === "invalid" ? "text-problem" : "text-mist";

  return (
    <AuthShell
      wide
      title="Ro’yxatdan o’tish"
      subtitle="Hisob ochib, muammolarga qo’shiling va o’z muammoingizni e’lon qiling. Saytni ko’rish uchun hisob shart emas."
    >
      <form onSubmit={submit} className="space-y-8">
        <section className="space-y-4">
          <h2 className="font-display text-base font-bold">Hisob ma’lumotlari</h2>

          <label className="block text-sm text-mist">
            Nik (login)
            <input
              className={`${field} mt-2`}
              placeholder="masalan: ali_dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <span className={`mt-1.5 block text-xs ${nickColor}`}>{nickHint}</span>
          </label>

          <label className="block text-sm text-mist">
            Email
            <input
              className={`${field} mt-2`}
              type="email"
              placeholder="siz@pochta.uz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-mist">
              Parol
              <div className="mt-2">
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Kamida 8 belgi"
                  autoComplete="new-password"
                />
              </div>
            </label>
            <label className="block text-sm text-mist">
              Parolni takrorlang
              <div className="mt-2">
                <PasswordInput
                  value={password2}
                  onChange={setPassword2}
                  placeholder="Parolni qayta kiriting"
                  autoComplete="new-password"
                />
              </div>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-base font-bold">Shaxsiy ma’lumotlar</h2>
          <p className="text-xs text-mist">
            Telefon, manzil va tug’ilgan sana boshqa foydalanuvchilarga ko’rsatilmaydi.
          </p>

          <label className="block text-sm text-mist">
            Ism va familiya
            <input
              className={`${field} mt-2`}
              placeholder="Ali Valiyev"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-mist">
              Telefon raqami
              <input
                className={`${field} mt-2`}
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
              />
            </label>
            <label className="block text-sm text-mist">
              Tug’ilgan sana (ixtiyoriy)
              <input
                className={`${field} mt-2`}
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-mist">
              Viloyat
              <select
                className={`${field} mt-2`}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
              >
                <option value="">Tanlang</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-mist">
              Shahar yoki tuman
              <input
                className={`${field} mt-2`}
                placeholder="Masalan: Chilonzor tumani"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="block text-sm text-mist">
            Ko’cha va uy (ixtiyoriy)
            <input
              className={`${field} mt-2`}
              placeholder="Masalan: Bunyodkor ko’chasi, 12-uy"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
            />
          </label>
        </section>

        <label className="flex items-start gap-3 text-sm text-mist">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#8b35ff]"
          />
          Platforma qoidalariga roziman: boshqalarga hurmat bilan munosabatda bo’laman
          va to’g’ri ma’lumot kiritaman.
        </label>

        <div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-project px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {busy ? "Yaratilmoqda..." : "Hisob yaratish"}
          </button>
          {message && <p className="mt-3 text-sm text-problem">{message}</p>}
        </div>
      </form>

      <p className="mt-6 text-sm text-mist">
        Hisobingiz bormi?{" "}
        <Link href={`/login${search}`} className="font-semibold text-team">
          Kirish
        </Link>
      </p>
    </AuthShell>
  );
}
