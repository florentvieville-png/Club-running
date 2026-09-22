import Link from "next/link";
import Image from "next/image";
import { ShieldCheckIcon, LogoutIcon } from "@/components/icons";
import type { UserRole } from "@/lib/types/database";

export function TopHeader({ role }: { role: UserRole }) {
  const isReviewer = role === "admin" || role === "coach";

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icons/logo-64.png" alt="La Loriolade" width={32} height={32} className="rounded-full" />
          <span className="font-semibold text-brand-blue-dark dark:text-white">La Loriolade</span>
        </Link>

        <div className="flex items-center gap-1">
          {isReviewer && (
            <Link
              href="/validation"
              className="flex items-center gap-1 rounded-full bg-brand-blue/10 px-3 py-1.5 text-xs font-medium text-brand-blue-dark dark:bg-brand-blue/20 dark:text-blue-300"
            >
              <ShieldCheckIcon className="h-4 w-4" />
              Validation
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              aria-label="Déconnexion"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
