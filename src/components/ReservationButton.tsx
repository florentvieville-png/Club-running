"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createReservation } from "@/app/actions/shop";

export function ReservationButton({ itemId }: { itemId: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (done) {
    return (
      <p className="text-sm font-medium text-green-700 dark:text-green-400">
        ✅ Demande envoyée
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand-orange px-3 py-1.5 text-sm font-medium text-white hover:brightness-95"
      >
        Réserver
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm text-zinc-500">Quantité</label>
        <input
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-16 rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Taille, précision... (optionnel)"
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="flex gap-2">
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await createReservation(itemId, quantity, note);
              setDone(true);
              router.refresh();
            })
          }
          className="rounded-lg bg-brand-orange px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 hover:brightness-95"
        >
          Confirmer la demande
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
