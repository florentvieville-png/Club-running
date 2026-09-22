"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CalendarIcon, PlusCircleIcon, ShopIcon, UserIcon } from "@/components/icons";

const TABS = [
  { href: "/", label: "Accueil", icon: HomeIcon },
  { href: "/evenements", label: "Événements", icon: CalendarIcon },
  { href: "/evenements/nouveau", label: "Proposer", icon: PlusCircleIcon, accent: true },
  { href: "/boutique", label: "Boutique", icon: ShopIcon },
  { href: "/membres", label: "Profil", icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-4xl items-end justify-around px-2 pb-1.5 pt-2">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.accent) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex -translate-y-3 flex-col items-center gap-0.5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange text-white shadow-lg shadow-orange-500/30">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="text-[10px] font-medium text-zinc-500">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 ${
                isActive ? "text-brand-orange" : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
