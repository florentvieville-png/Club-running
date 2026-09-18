"use client";

import { useTransition } from "react";
import { deleteAnnouncement } from "@/app/actions/announcements";

export function DeleteAnnouncementButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => deleteAnnouncement(id))}
      className="text-xs text-zinc-400 hover:text-red-600 disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}
