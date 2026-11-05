import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Nik + parol bilan kirish. Nikka tegishli email faqat serverda topiladi
// va brauzerga hech qachon yuborilmaydi.
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !anonKey || !secretKey) {
    return NextResponse.json(
      { error: "Server sozlanmagan: SUPABASE_SECRET_KEY topilmadi." },
      { status: 500 }
    );
  }

  let username = "";
  let password = "";
  try {
    const body = await request.json();
    username = String(body.username ?? "").trim();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "So’rov noto’g’ri." }, { status: 400 });
  }

  const wrong = NextResponse.json(
    { error: "Nik yoki parol noto’g’ri." },
    { status: 401 }
  );

  if (!/^[A-Za-z0-9_]{3,20}$/.test(username) || !password) return wrong;

  const admin = createClient(url, secretKey, { auth: { persistSession: false } });

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return wrong;

  const { data: priv } = await admin
    .from("profile_private")
    .select("email")
    .eq("id", profile.id)
    .maybeSingle();
  if (!priv?.email) return wrong;

  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({
    email: priv.email,
    password,
  });

  if (error || !data.session) {
    if (error?.message?.toLowerCase().includes("not confirmed")) {
      return NextResponse.json(
        { error: "Emailingiz hali tasdiqlanmagan. Pochtangizni tekshiring." },
        { status: 401 }
      );
    }
    return wrong;
  }

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}
