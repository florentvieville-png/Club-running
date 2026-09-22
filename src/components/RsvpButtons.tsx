"use client";

import { useTransition } from "react";
import { setRsvp } from "@/app/actions/events";
import { RSVP_LABELS, type RsvpStatus } from "@/lib/types/database";

const OPTIONS: RsvpStatus[] = ["going", "maybe", "not_going"];

export function RsvpButtons({ eventId, current }: { eventId: string; current: RsvpStatus | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option}
          disabled={isPending}
          onClick={() => startTransition(() => setRsvp(eventId, option))}
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
  );
}
