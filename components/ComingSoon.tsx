import Link from "next/link";

export default function ComingSoon({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20">
      <div className="glass rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-mist">{text}</p>
        <p className="mt-2 text-sm text-mist">
          Bu bo’lim keyingi bosqichda ishga tushadi.
        </p>
        <Link href="/problems" className="mt-6 inline-block font-semibold text-team">
          Muammolarga o’tish
        </Link>
      </div>
    </main>
  );
}
