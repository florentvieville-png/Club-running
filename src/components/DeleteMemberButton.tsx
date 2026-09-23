"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMember } from "@/app/actions/profiles";
import { TrashIcon } from "@/components/icons";

export function DeleteMemberButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Supprimer ce membre"
        className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950">
      <p className="text-red-800 dark:text-red-200">
        Suppression définitive et irréversible du compte de <strong>{memberName}</strong>{" "}
        (profil, connexion, et toutes ses réservations/messages/RSVP). Pour confirmer, tapez son
        nom complet ci-dessous :
      </p>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={memberName}
        className="rounded-lg border border-red-300 px-3 py-2 text-sm dark:border-red-800 dark:bg-zinc-900"
      />
      {error && <p className="text-red-700 dark:text-red-300">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending || typed.trim() !== memberName.trim()}
          onClick={() =>
            startTransition(async () => {
              try {
                await deleteMember(memberId);
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
              }
            })
          }
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Suppression..." : "Supprimer définitivement"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setTyped("");
            setError(null);
          }}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
