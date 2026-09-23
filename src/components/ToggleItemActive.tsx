"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleShopItemActive } from "@/app/actions/shop";

export function ToggleItemActive({ itemId, active }: { itemId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleShopItemActive(itemId, !active);
          router.refresh();
        })
      }
      className="text-xs text-zinc-400 hover:text-brand-orange disabled:opacity-50"
    >
      {active ? "Masquer" : "Réactiver"}
    </button>
  );
}
