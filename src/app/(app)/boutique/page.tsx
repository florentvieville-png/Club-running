import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { ReservationButton } from "@/components/ReservationButton";
import { ShopItemForm } from "@/components/ShopItemForm";
import { ShopItemActions } from "@/components/ShopItemActions";
import { ToggleItemActive } from "@/components/ToggleItemActive";
import { ShopIcon, ChevronRightIcon } from "@/components/icons";
import type { ShopItem } from "@/lib/types/database";

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Boutique du club</h1>
        <p className="text-sm text-zinc-500">
          Faites une demande de réservation, le bureau vous recontacte pour la remise et le
          règlement (pas de paiement en ligne).
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative h-36 w-full">
          <Image src="/images/hero-trail.webp" alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-center gap-1 px-5 text-white">
          <p className="text-lg font-bold">Collection La Loriolade</p>
          <p className="text-sm text-white/85">Le style du club, sur et en dehors des sentiers.</p>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3">
        {visibleItems.length === 0 && (
          <p className="col-span-2 text-sm text-zinc-400">Aucun article disponible pour l&apos;instant.</p>
        )}
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${
              !item.active ? "opacity-50" : ""
            }`}
          >
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.name} className="aspect-square w-full object-cover" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-brand-blue-dark to-brand-blue">
                <ShopIcon className="h-8 w-8 text-white/70" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1.5 p-3">
              <div className="flex items-start justify-between gap-1">
                <h3 className="text-sm font-semibold leading-tight">{item.name}</h3>
                {isReviewer && <ToggleItemActive itemId={item.id} active={item.active} />}
              </div>
              {item.price_label && (
                <p className="text-sm font-semibold text-brand-orange">{item.price_label}</p>
              )}
              {item.description && (
                <p className="line-clamp-2 text-xs text-zinc-500">{item.description}</p>
              )}
              {item.active && (
                <div className="mt-auto pt-1">
                  <ReservationButton itemId={item.id} />
                </div>
              )}
              {isReviewer && <ShopItemActions item={item} />}
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

          <Link
            href="/boutique/demandes"
            className="flex items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">Gérer les demandes</p>
              <p className="text-sm text-zinc-500">Statuts, quantités et export pour les commandes</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-zinc-300" />
          </Link>
        </>
      )}
    </div>
  );
}
