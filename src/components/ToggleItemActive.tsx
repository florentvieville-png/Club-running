"use client";

import { useTransition } from "react";
import { toggleShopItemActive } from "@/app/actions/shop";

export function ToggleItemActive({ itemId, active }: { itemId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleShopItemActive(itemId, !active))}
      className="text-xs text-zinc-400 hover:text-orange-600 disabled:opacity-50"
    >
      {active ? "Masquer" : "Réactiver"}
    </button>
  );
}
