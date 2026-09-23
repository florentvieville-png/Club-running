"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/icons";

export function ShareButton() {
  const [open, setOpen] = useState(false);

  async function handleClick() {
    const shareData = {
      title: "La Loriolade",
      text: "Rejoins-nous sur l'appli de La Loriolade !",
      url: typeof window !== "undefined" ? window.location.origin : "",
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // partage annulé par l'utilisateur : rien à faire
      }
      return;
    }

    setOpen((v) => !v);
  }

  const url = typeof window !== "undefined" ? window.location.origin : "";
  const text = encodeURIComponent("Rejoins-nous sur l'appli de La Loriolade !");
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
      >
        <ShareIcon className="h-4 w-4" />
        Partager l&apos;appli
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-10 mb-2 flex w-48 flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <a
            href={`https://wa.me/?text=${text}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent("La Loriolade")}&body=${text}%20${encodedUrl}`}
            className="rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            E-mail
          </a>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
              } catch {
                // presse-papiers indisponible : on ignore
              }
              setOpen(false);
            }}
            className="rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Copier le lien
          </button>
        </div>
      )}
    </div>
  );
}
