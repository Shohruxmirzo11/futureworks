"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [text, setText] = useState("Tekshirilmoqda...");

  useEffect(() => {
    supabase
      .from("problems")
      .select("id")
      .then(({ data, error }) => {
        setText(
          error
            ? "Xato: " + error.message
            : "Ulandi! Muammolar soni: " + (data?.length ?? 0)
        );
      });
  }, []);

  return (
    <main>
      <h1>FutureWorks</h1>
      <p>{text}</p>
    </main>
  );
}