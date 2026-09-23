"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRsvp } from "@/app/actions/events";
import { RSVP_LABELS, type RsvpStatus } from "@/lib/types/database";

const OPTIONS: RsvpStatus[] = ["going", "maybe", "not_going"];

export function RsvpButtons({ eventId, current }: { eventId: string; current: RsvpStatus | null }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                try {
                  await setRsvp(eventId, option);
                  router.refresh();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Une erreur est survenue");
                }
              })
            }
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              current === option
                ? "bg-brand-orange text-white "
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {RSVP_LABELS[option]}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
