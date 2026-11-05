// Jamoa to'lganligini nuqtalar bilan ko'rsatadi: to'lgan = yorqin, bo'sh = bo'sh doira
export default function TeamDots({
  filled,
  total,
}: {
  filled: number;
  total: number;
}) {
  const count = Math.min(total, 10);

  return (
    <div className="flex gap-1.5" aria-label={`${filled} / ${total}`}>
      {Array.from({ length: count }, (_, i) =>
        i < filled ? (
          <span
            key={i}
            className="h-3 w-3 rounded-full bg-team shadow-[0_0_10px_rgba(0,213,255,0.63)]"
          />
        ) : (
          <span
            key={i}
            className="h-3 w-3 animate-pulse rounded-full border border-team/70"
          />
        )
      )}
    </div>
  );
}
