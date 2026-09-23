"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ShopReservationStatus } from "@/lib/types/database";

export type ShopItemState = { error?: string; ok?: number };

async function uploadShopImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  imageFile: File
): Promise<{ url: string } | { error: string }> {
  if (!imageFile.type.startsWith("image/")) {
    return { error: "Le fichier doit être une image" };
  }
  const extension = imageFile.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("shop-images")
    .upload(path, imageFile, { contentType: imageFile.type });

  if (uploadError) return { error: `Échec de l'envoi de la photo : ${uploadError.message}` };

  const { data: pub } = supabase.storage.from("shop-images").getPublicUrl(path);
  return { url: pub.publicUrl };
}

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
  const price_label = String(formData.get("price_label") ?? "").trim();
  const imageFile = formData.get("image");

  if (name.length < 2) {
    return { error: "Nom de l'article requis" };
  }

  const supabase = await createClient();

  let image_url: string | null = null;
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadShopImage(supabase, imageFile);
    if ("error" in uploaded) return { error: uploaded.error };
    image_url = uploaded.url;
  }

  const { error } = await supabase.from("shop_items").insert({
    name,
    description: description || null,
    image_url,
    price_label: price_label || null,
    created_by: current.userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/boutique");
  return { ok: Date.now() };
}

export async function updateShopItem(
  itemId: string,
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
  const price_label = String(formData.get("price_label") ?? "").trim();
  const imageFile = formData.get("image");

  if (name.length < 2) {
    return { error: "Nom de l'article requis" };
  }

  const supabase = await createClient();

  const patch: {
    name: string;
    description: string | null;
    price_label: string | null;
    image_url?: string;
  } = {
    name,
    description: description || null,
    price_label: price_label || null,
  };

  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadShopImage(supabase, imageFile);
    if ("error" in uploaded) return { error: uploaded.error };
    patch.image_url = uploaded.url;
  }

  const { error } = await supabase.from("shop_items").update(patch).eq("id", itemId);
  if (error) return { error: error.message };

  revalidatePath("/boutique");
  return { ok: Date.now() };
}

export async function deleteShopItem(itemId: string) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    throw new Error("Réservé aux coachs et admins");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shop_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/boutique");
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

export async function createReservation(itemId: string, quantity: number, note: string) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase.from("shop_reservations").insert({
    item_id: itemId,
    user_id: current.userId,
    quantity: Math.max(1, Math.round(quantity) || 1),
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
  revalidatePath("/boutique/demandes");
}
