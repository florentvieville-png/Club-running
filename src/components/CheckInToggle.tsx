"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleCheckIn } from "@/app/actions/events";

export function CheckInToggle({
  eventId,
  userId,
  checkedIn,
}: {
  eventId: string;
  userId: string;
  checkedIn: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleCheckIn(eventId, userId, !checkedIn);
          router.refresh();
        })
      }
      className={`rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
        checkedIn
          ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      }`}
    >
      {checkedIn ? "✅ Présent" : "Marquer présent"}
    </button>
  );
}
