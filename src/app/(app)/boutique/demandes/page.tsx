import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { ReservationStatusControl } from "@/components/ReservationStatusControl";
import { ArrowLeftIcon } from "@/components/icons";
import { SHOP_RESERVATION_LABELS, type ShopReservationWithDetails } from "@/lib/types/database";

export default async function ShopReservationsAdminPage() {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  const isReviewer = current.profile.role === "admin" || current.profile.role === "coach";
  if (!isReviewer) redirect("/boutique");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_reservations")
    .select("*, item:shop_items(id, name), member:profiles!shop_reservations_user_id_fkey(id, full_name)")
    .order("created_at", { ascending: false });
  if (error) console.error("shop_reservations select failed:", error.message);

  const reservations = (data ?? []) as unknown as ShopReservationWithDetails[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link
          href="/boutique"
          aria-label="Retour"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Demandes boutique</h1>
      </div>

      <a
        href="/api/boutique/export"
        className="flex w-fit items-center gap-2 rounded-lg bg-brand-orange px-3 py-1.5 text-sm font-medium text-white hover:brightness-95"
      >
        Exporter en Excel
      </a>

      {reservations.length === 0 && (
        <p className="text-sm text-zinc-400">Aucune demande pour l&apos;instant.</p>
      )}

      <div className="flex flex-col divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {reservations.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">{r.member?.full_name ?? "Membre"}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                {r.item?.name ?? "Article supprimé"} × {r.quantity}
              </p>
              {r.note && <p className="text-xs text-zinc-500">{r.note}</p>}
              <p className="text-xs text-zinc-400">
                {new Date(r.created_at).toLocaleDateString("fr-FR")} · {SHOP_RESERVATION_LABELS[r.status]}
              </p>
            </div>
            <ReservationStatusControl reservationId={r.id} status={r.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
