"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";

type Row = {
  id: number;
  requester_id: string;
  addressee_id: string;
  status: string;
};

const primary =
  "rounded-full bg-team px-5 py-2.5 text-sm font-semibold text-night transition hover:-translate-y-0.5 disabled:opacity-50";
const ghost =
  "rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-mist transition hover:border-problem hover:text-problem disabled:opacity-50";

export default function FriendButton({
  otherId,
  username,
}: {
  otherId: string;
  username: string;
}) {
  const router = useRouter();
  const { user } = useUser();
  const [row, setRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      setRow(null);
      return;
    }
    const { data } = await supabase
      .from("friendships")
      .select("id,requester_id,addressee_id,status")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${user.id})`
      )
      .maybeSingle();
    setRow((data as Row | null) ?? null);
  }, [user, otherId]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(
    action: () => PromiseLike<{ error: { message: string } | null }>
  ) {
    setBusy(true);
    setMessage("");
    const { error } = await action();
    setBusy(false);
    if (error) setMessage("Xato: " + error.message);
    else await load();
  }

  function add() {
    if (!user) {
      router.push(`/login?next=/u/${username}`);
      return;
    }
    run(() =>
      supabase
        .from("friendships")
        .insert({ requester_id: user.id, addressee_id: otherId })
    );
  }

  const accept = () =>
    run(() =>
      supabase.from("friendships").update({ status: "accepted" }).eq("id", row!.id)
    );
  const remove = () =>
    run(() => supabase.from("friendships").delete().eq("id", row!.id));

  let content;
  if (!user || !row) {
    content = (
      <button onClick={add} disabled={busy} className={primary}>
        Do’st qo’shish
      </button>
    );
  } else if (row.status === "accepted") {
    content = (
      <>
        <span className="text-sm font-semibold text-team">Do’stlar</span>
        <button onClick={remove} disabled={busy} className={ghost}>
          Do’stlikni tugatish
        </button>
      </>
    );
  } else if (row.requester_id === user.id) {
    content = (
      <>
        <span className="text-sm text-mist">So’rov yuborildi</span>
        <button onClick={remove} disabled={busy} className={ghost}>
          Bekor qilish
        </button>
      </>
    );
  } else {
    content = (
      <>
        <button onClick={accept} disabled={busy} className={primary}>
          Qabul qilish
        </button>
        <button onClick={remove} disabled={busy} className={ghost}>
          Rad etish
        </button>
      </>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">{content}</div>
      {message && <p className="mt-2 text-sm text-problem">{message}</p>}
    </div>
  );
}
