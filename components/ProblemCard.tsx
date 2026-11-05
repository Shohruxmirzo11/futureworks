import Link from "next/link";
import TeamDots from "@/components/TeamDots";
import { filledOf, formatDate, statuses } from "@/lib/problems";
import type { Problem } from "@/lib/problems";

export function StatusBadge({ status }: { status: string }) {
  const s = statuses[status] ?? statuses.recruiting;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{ borderColor: s.color + "66", color: s.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export default function ProblemCard({ p }: { p: Problem }) {
  const filled = filledOf(p);

  return (
    <Link
      href={`/problems/${p.id}`}
      className="glass group flex h-full flex-col rounded-2xl p-5 transition hover:-translate-y-1 hover:border-project/60"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-problem">{p.category}</span>
        <StatusBadge status={p.status} />
      </div>

      <h3 className="mt-3 font-display text-base font-bold leading-snug transition group-hover:text-team">
        {p.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-mist">{p.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(p.skills ?? []).slice(0, 4).map((s) => (
          <span
            key={s}
            className="rounded-full border border-line px-2.5 py-0.5 text-xs text-mist"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-mist">
        <span className="truncate">
          {p.profiles?.username ?? "Noma’lum"} · {formatDate(p.created_at)}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <TeamDots filled={filled} total={p.team_size} />
          {filled}/{p.team_size}
        </span>
      </div>
    </Link>
  );
}
