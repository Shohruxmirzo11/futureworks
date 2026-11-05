export default function Avatar({
  name,
  size = 40,
}: {
  name: string;
  size?: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b35ff,#286bff)] font-bold uppercase"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.trim()[0] ?? "?"}
    </span>
  );
}
