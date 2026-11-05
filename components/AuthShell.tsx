export default function AuthShell({
  title,
  subtitle,
  wide = false,
  children,
}: {
  title: string;
  subtitle?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className={`mx-auto px-5 py-12 sm:py-16 ${wide ? "max-w-2xl" : "max-w-lg"}`}>
      <div className="glass rounded-3xl p-6 sm:p-9">
        <p className="flex items-center gap-2.5 font-display text-sm font-bold">
          <span className="h-3 w-3 rounded-full bg-[linear-gradient(135deg,#e548ff,#8b35ff,#00d5ff)] shadow-[0_0_10px_rgba(139,53,255,0.6)]" />
          FutureWorks
        </p>
        <h1 className="mt-6 font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-3 text-sm text-mist">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
