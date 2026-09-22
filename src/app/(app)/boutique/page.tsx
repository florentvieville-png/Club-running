import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { ReservationButton } from "@/components/ReservationButton";
import { ShopItemForm } from "@/components/ShopItemForm";
import { ReservationStatusControl } from "@/components/ReservationStatusControl";
import { ToggleItemActive } from "@/components/ToggleItemActive";
import { ShopIcon } from "@/components/icons";
import {
  SHOP_RESERVATION_LABELS,
  type ShopItem,
  type ShopReservationWithDetails,
} from "@/lib/types/database";

export default async function BoutiquePage() {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const isReviewer = current.profile.role === "admin" || current.profile.role === "coach";
  const supabase = await createClient();

  const { data: itemsData } = await supabase
    .from("shop_items")
    .select("*")
    .order("created_at", { ascending: false });
  const items = (itemsData ?? []) as ShopItem[];
  const visibleItems = isReviewer ? items : items.filter((i) => i.active);

  let reservations: ShopReservationWithDetails[] = [];
  if (isReviewer) {
    const { data: reservationsData } = await supabase
      .from("shop_reservations")
      .select("*, item:shop_items(id, name), member:profiles(id, full_name)")
      .order("created_at", { ascending: false });
    reservations = (reservationsData ?? []) as unknown as ShopReservationWithDetails[];
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Boutique du club</h1>
        <p className="text-sm text-zinc-500">
          Faites une demande de réservation, le bureau vous recontacte pour la remise et le
          règlement (pas de paiement en ligne).
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleItems.length === 0 && (
          <p className="text-sm text-zinc-400">Aucun article disponible pour l&apos;instant.</p>
        )}
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col gap-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${
              !item.active ? "opacity-50" : ""
            }`}
          >
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.name} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-brand-blue-dark to-brand-blue">
                <ShopIcon className="h-10 w-10 text-white/70" />
              </div>
            )}
            <div className="flex flex-col gap-2 p-4 pt-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{item.name}</h3>
                {isReviewer && <ToggleItemActive itemId={item.id} active={item.active} />}
              </div>
              {item.description && <p className="text-sm text-zinc-600 dark:text-zinc-300">{item.description}</p>}
              {item.price_label && <p className="text-sm font-semibold text-brand-orange">{item.price_label}</p>}
              {item.active && <ReservationButton itemId={item.id} />}
            </div>
          </div>
        ))}
      </section>

      {isReviewer && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Ajouter un article
            </h2>
            <ShopItemForm />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Demandes de réservation
            </h2>
            {reservations.length === 0 && (
              <p className="text-sm text-zinc-400">Aucune demande pour l&apos;instant.</p>
            )}
            <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {reservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {r.item?.name ?? "Article supprimé"} — {r.member?.full_name ?? "Membre"}
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
          </section>
        </>
      )}
    </div>
  );
}
