"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isValidPhone, normalizePhone, regions } from "@/lib/regions";

type Priv = {
  email: string | null;
  phone: string | null;
  region: string | null;
  district: string | null;
  address: string | null;
  birth_date: string | null;
};

const field =
  "w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-snow outline-none transition placeholder:text-mist/60 focus:border-team";

export default function PrivateInfo({ userId }: { userId: string }) {
  const [info, setInfo] = useState<Priv | null>(null);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase
      .from("profile_private")
      .select("email,phone,region,district,address,birth_date")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        const d: Priv = (data as Priv | null) ?? {
          email: null,
          phone: null,
          region: null,
          district: null,
          address: null,
          birth_date: null,
        };
        setInfo(d);
        setPhone(d.phone ?? "");
        setRegion(d.region ?? "");
        setDistrict(d.district ?? "");
        setAddress(d.address ?? "");
        setBirthDate(d.birth_date ?? "");
      });
  }, [userId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (phone && !isValidPhone(phone)) {
      setMessage("Telefon raqami noto’g’ri.");
      return;
    }
    setBusy(true);
    setMessage("");
    const patch = {
      phone: phone ? normalizePhone(phone) : null,
      region: region || null,
      district: district.trim() || null,
      address: address.trim() || null,
      birth_date: birthDate || null,
    };
    const { error } = await supabase
      .from("profile_private")
      .upsert({ id: userId, ...patch });
    setBusy(false);
    if (error) {
      setMessage("Xato: " + error.message);
      return;
    }
    setInfo((prev) => ({
      email: prev?.email ?? null,
      ...patch,
    }));
    setEditing(false);
  }

  if (!info) return null;

  const rows: [string, string | null][] = [
    ["Email", info.email],
    ["Telefon", info.phone],
    ["Hudud", [info.region, info.district].filter(Boolean).join(", ") || null],
    ["Manzil", info.address],
    ["Tug’ilgan sana", info.birth_date],
  ];

  return (
    <section className="mx-auto max-w-5xl px-5 pb-20">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold">Shaxsiy ma’lumotlar</h2>
            <p className="mt-1 text-sm text-mist">
              Bu ma’lumotlarni faqat siz ko’rasiz. Boshqa foydalanuvchilarga
              ko’rsatilmaydi.
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="shrink-0 rounded-full border border-project/70 px-5 py-2 text-sm font-semibold text-project transition hover:bg-project/10"
          >
            {editing ? "Bekor qilish" : "Tahrirlash"}
          </button>
        </div>

        {!editing ? (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-mist">{label}</dt>
                <dd className="mt-1 text-sm">{value || "Kiritilmagan"}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <form onSubmit={save} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-mist">
                Telefon raqami
                <input className={`${field} mt-2`} placeholder="+998 90 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              <label className="block text-sm text-mist">
                Tug’ilgan sana
                <input className={`${field} mt-2`} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-mist">
                Viloyat
                <select className={`${field} mt-2`} value={region} onChange={(e) => setRegion(e.target.value)}>
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
                <input className={`${field} mt-2`} value={district} onChange={(e) => setDistrict(e.target.value)} />
              </label>
            </div>
            <label className="block text-sm text-mist">
              Ko’cha va uy
              <input className={`${field} mt-2`} value={address} onChange={(e) => setAddress(e.target.value)} />
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
      </div>
    </section>
  );
}
