"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAnnouncement } from "@/app/actions/announcements";

export function DeleteAnnouncementButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteAnnouncement(id);
          router.refresh();
        })
      }
      className="text-xs text-zinc-400 hover:text-red-600 disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}
