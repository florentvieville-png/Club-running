"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ShopReservationStatus } from "@/lib/types/database";

export type ShopItemState = { error?: string };

export async function createShopItem(
  _prevState: ShopItemState,
  formData: FormData
): Promise<ShopItemState> {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    return { error: "Réservé aux coachs et admins" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const image_url = String(formData.get("image_url") ?? "").trim();
  const price_label = String(formData.get("price_label") ?? "").trim();

  if (name.length < 2) {
    return { error: "Nom de l'article requis" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shop_items").insert({
    name,
    description: description || null,
    image_url: image_url || null,
    price_label: price_label || null,
    created_by: current.userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/boutique");
  return {};
}

export async function toggleShopItemActive(itemId: string, active: boolean) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    throw new Error("Réservé aux coachs et admins");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shop_items").update({ active }).eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/boutique");
}

export async function createReservation(itemId: string, note: string) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase.from("shop_reservations").insert({
    item_id: itemId,
    user_id: current.userId,
    note: note || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/boutique");
}

export async function updateReservationStatus(
  reservationId: string,
  status: ShopReservationStatus
) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    throw new Error("Réservé aux coachs et admins");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("shop_reservations")
    .update({ status, handled_by: current.userId, handled_at: new Date().toISOString() })
    .eq("id", reservationId);

  if (error) throw new Error(error.message);
  revalidatePath("/boutique");
}
