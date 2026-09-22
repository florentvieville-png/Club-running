"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "loriolade-install-dismissed";

function isStandalone() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint] = useState(() => {
    if (typeof window === "undefined") return false;
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  });
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isStandalone()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // stockage indisponible (navigation privée...) : on ignore simplement
    }
  }

  if (dismissed || isStandalone()) return null;
  if (!deferredPrompt && !showIosHint) return null;

  return (
    <div className="safe-bottom fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-2xl">📲</span>
      <div className="flex-1 text-sm">
        {deferredPrompt ? (
          <p>Installez La Loriolade App sur votre écran d&apos;accueil.</p>
        ) : (
          <p>
            Pour l&apos;installer : appuyez sur <strong>Partager</strong>, puis{" "}
            <strong>&quot;Sur l&apos;écran d&apos;accueil&quot;</strong>.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {deferredPrompt && (
          <button
            onClick={async () => {
              await deferredPrompt.prompt();
              await deferredPrompt.userChoice;
              setDeferredPrompt(null);
              dismiss();
            }}
            className="rounded-lg bg-brand-orange px-2 py-1 text-xs font-medium text-white hover:brightness-95"
          >
            Installer
          </button>
        )}
        <button onClick={dismiss} className="text-xs text-zinc-400">
          Fermer
        </button>
      </div>
    </div>
  );
}
