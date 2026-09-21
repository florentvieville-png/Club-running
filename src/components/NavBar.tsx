"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@/lib/types/database";

type NavLink = { href: string; label: string; roles?: UserRole[] };

const LINKS: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/evenements", label: "Séances & courses" },
  { href: "/evenements/nouveau", label: "Proposer" },
  { href: "/boutique", label: "Boutique" },
  { href: "/validation", label: "Validation", roles: ["coach", "admin"] },
  { href: "/membres", label: "Membres" },
];

export function NavBar({ role, fullName }: { role: UserRole; fullName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = LINKS.filter((l) => !l.roles || l.roles.includes(role));

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
          <span
            aria-hidden
            className="inline-block h-6 w-6 rounded-full bg-orange-600"
            style={{
              backgroundImage: "url(/icons/icon-192.png)",
              backgroundSize: "cover",
            }}
          />
          La Loriolade App
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-orange-600 text-white dark:bg-orange-500"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <form action="/auth/signout" method="post" className="ml-2">
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              Déconnexion
            </button>
          </form>
        </nav>

        <button
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm sm:hidden dark:border-zinc-700"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-zinc-200 px-4 py-3 sm:hidden dark:border-zinc-800">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === link.href
                  ? "bg-orange-600 text-white dark:bg-orange-500"
                  : "text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-1 flex items-center justify-between border-t border-zinc-200 pt-2 dark:border-zinc-800">
            <span className="text-xs text-zinc-400">{fullName}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-zinc-500">
                Déconnexion
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
}
