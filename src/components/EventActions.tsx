"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { deleteEvent } from "@/app/actions/events";
import { PencilIcon, TrashIcon } from "@/components/icons";

export function EventActions({ eventId }: { eventId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Link
          href={`/evenements/${eventId}/modifier`}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
        >
          <PencilIcon className="h-4 w-4" />
          Modifier
        </Link>
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Confirmer la suppression ?</span>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await deleteEvent(eventId);
                  } catch (err) {
                    unstable_rethrow(err);
                    setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
                    setConfirming(false);
                  }
                })
              }
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPending ? "Suppression..." : "Oui, supprimer"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 dark:border-red-900 dark:text-red-400"
          >
            <TrashIcon className="h-4 w-4" />
            Supprimer
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
