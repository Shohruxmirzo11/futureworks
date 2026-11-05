"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CirclePlus,
  Compass,
  Handshake,
  House,
  User,
  Users,
} from "lucide-react";

const items = [
  { href: "/", label: "Bosh sahifa", short: "Bosh", icon: House },
  { href: "/problems", label: "Muammolar", short: "Muammolar", icon: Compass },
  { href: "/new", label: "Muammo e’lon qilish", short: "E’lon", icon: CirclePlus },
  { href: "/friends", label: "Do’stlar", short: "Do’stlar", icon: Users },
  { href: "/teams", label: "Jamoalarim", short: "Jamoa", icon: Handshake },
  { href: "/profile", label: "Profil", short: "Profil", icon: User },
];

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Kompyuter: chap tomondagi menyu */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-deep/80 p-5 backdrop-blur-md lg:flex">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-2 font-display text-lg font-bold tracking-tight"
        >
          <span className="h-3 w-3 rounded-full bg-[linear-gradient(135deg,#e548ff,#8b35ff,#00d5ff)] shadow-[0_0_10px_rgba(139,53,255,0.6)]" />
          FutureWorks
        </Link>

        <nav className="mt-10 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-project/15 text-snow shadow-[inset_0_0_0_1px_rgba(139,53,255,0.45)]"
                    : "text-mist hover:bg-white/5 hover:text-snow"
                }`}
              >
                <Icon size={18} className={active ? "text-project" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        <p className="mt-auto px-2 text-xs leading-relaxed text-mist">
          Kelajakni faqat tasavvur qilma. Uni yarat.
        </p>
      </aside>

      {/* Telefon va planshet: pastdagi menyu */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-deep/90 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        {items.map(({ href, short, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition ${
                active ? "text-project" : "text-mist"
              }`}
            >
              <Icon size={20} />
              {short}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
