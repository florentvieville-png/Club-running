"use client";

import { useTransition } from "react";
import { updateReservationStatus } from "@/app/actions/shop";
import { SHOP_RESERVATION_LABELS, type ShopReservationStatus } from "@/lib/types/database";

const OPTIONS: ShopReservationStatus[] = ["pending", "fulfilled", "cancelled"];

export function ReservationStatusControl({
  reservationId,
  status,
}: {
  reservationId: string;
  status: ShopReservationStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() =>
          updateReservationStatus(reservationId, e.target.value as ShopReservationStatus)
        )
      }
      className="rounded-lg border border-zinc-300 bg-transparent px-2 py-1 text-xs dark:border-zinc-700"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {SHOP_RESERVATION_LABELS[o]}
        </option>
      ))}
    </select>
  );
}
