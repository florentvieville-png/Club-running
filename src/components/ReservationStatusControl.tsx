"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const value = e.target.value as ShopReservationStatus;
        startTransition(async () => {
          await updateReservationStatus(reservationId, value);
          router.refresh();
        });
      }}
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
