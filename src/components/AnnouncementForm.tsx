"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createAnnouncement, type AnnouncementState } from "@/app/actions/announcements";

const initialState: AnnouncementState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-fit rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
    >
      {pending ? "Publication..." : "Publier l'annonce"}
    </button>
  );
}

export function AnnouncementForm() {
  const [state, formAction] = useActionState(createAnnouncement, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <input
        name="title"
        placeholder="Titre de l'annonce"
        required
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <textarea
        name="content"
        placeholder="Message..."
        rows={2}
        required
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="pinned" className="h-4 w-4" />
        Épingler en haut du fil
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
