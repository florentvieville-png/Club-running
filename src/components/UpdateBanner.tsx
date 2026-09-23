"use client";

import { useEffect, useRef, useState } from "react";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

async function fetchVersion(): Promise<string | null> {
  try {
    const res = await fetch("/api/version", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { version: string };
    return data.version;
  } catch {
    return null;
  }
}

export function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const knownVersion = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const version = await fetchVersion();
      if (!version || cancelled) return;
      if (knownVersion.current === null) {
        knownVersion.current = version;
        return;
      }
      if (version !== knownVersion.current) {
        setUpdateAvailable(true);
      }
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);

    function onVisible() {
      if (document.visibilityState === "visible") check();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="safe-top fixed inset-x-4 top-3 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-brand-orange/30 bg-white p-3 shadow-lg dark:border-brand-orange/40 dark:bg-zinc-900">
      <span className="text-xl">🔄</span>
      <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-200">
        Une nouvelle version de l&apos;app est disponible.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-brand-orange px-2.5 py-1.5 text-xs font-medium text-white hover:brightness-95"
      >
        Actualiser
      </button>
    </div>
  );
}
