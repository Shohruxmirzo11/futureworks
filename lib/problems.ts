export type Problem = {
  id: number;
  author_id: string;
  title: string;
  description: string;
  category: string;
  skills: string[] | null;
  team_size: number;
  status: string;
  created_at: string;
  profiles: { username: string } | null;
  team_members: { count: number }[];
};

// "profiles!author_id" muallifni aniq tanlaydi (team_members orqali ikkinchi yo'l ham bor)
export const PROBLEM_SELECT =
  "id,author_id,title,description,category,skills,team_size,status,created_at,profiles!author_id(username),team_members(count)";

export const categories = [
  "Texnologiya",
  "Sun’iy intellekt",
  "Dasturlash",
  "Muhandislik",
  "Fan",
  "Atrof-muhit",
  "Ta’lim",
  "Sog’liqni saqlash",
  "Energetika",
  "Qishloq xo’jaligi",
  "Transport",
  "Aqlli shaharlar",
  "Kiberxavfsizlik",
  "Ijtimoiy muammolar",
  "Boshqa",
];

export const statuses: Record<string, { label: string; color: string }> = {
  recruiting: { label: "Jamoa yig’ilmoqda", color: "#00d5ff" },
  planning: { label: "Rejalashtirilmoqda", color: "#286bff" },
  in_progress: { label: "Jarayonda", color: "#8b35ff" },
  completed: { label: "Yakunlangan", color: "#3ddc97" },
  paused: { label: "To’xtatilgan", color: "#9ba8c7" },
};

export const filledOf = (p: Problem) => p.team_members?.[0]?.count ?? 0;

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "hozirgina";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}
