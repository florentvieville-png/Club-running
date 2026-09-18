"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createEventSchema = z
  .object({
    type: z.enum(["seance", "course", "autre"]),
    title: z.string().trim().min(3, "Titre trop court").max(120),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    starts_at: z.string().min(1, "Date requise"),
    location_name: z.string().trim().max(200).optional().or(z.literal("")),
    show_on_map: z.coerce.boolean(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    external_link: z
      .string()
      .trim()
      .url("Lien invalide")
      .optional()
      .or(z.literal("")),
    distance_km: z.coerce.number().positive().optional(),
  })
  .refine((data) => !data.show_on_map || (data.latitude != null && data.longitude != null), {
    message: "Coordonnées requises pour afficher le point de RDV sur la carte",
    path: ["show_on_map"],
  });

export type CreateEventState = {
  error?: string;
};

export async function createEvent(
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const raw = {
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    starts_at: formData.get("starts_at"),
    location_name: formData.get("location_name"),
    show_on_map: formData.get("show_on_map") === "on",
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
    external_link: formData.get("external_link"),
    distance_km: formData.get("distance_km") || undefined,
  };

  const parsed = createEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description || null,
      starts_at: new Date(parsed.data.starts_at).toISOString(),
      location_name: parsed.data.location_name || null,
      show_on_map: parsed.data.show_on_map,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      external_link: parsed.data.external_link || null,
      distance_km: parsed.data.distance_km ?? null,
      created_by: current.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Impossible de créer l'événement" };
  }

  revalidatePath("/evenements");
  redirect(`/evenements/${data.id}`);
}

export async function approveEvent(eventId: string) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    throw new Error("Action réservée aux coachs et admins");
  }

  const supabase = await createClient();
  const patch =
    current.profile.role === "admin"
      ? { admin_approved_by: current.userId, admin_approved_at: new Date().toISOString() }
      : { coach_approved_by: current.userId, coach_approved_at: new Date().toISOString() };

  const { error } = await supabase.from("events").update(patch).eq("id", eventId);
  if (error) throw new Error(error.message);

  revalidatePath("/evenements");
  revalidatePath(`/evenements/${eventId}`);
  revalidatePath("/validation");
}

export async function rejectEvent(eventId: string, reason: string) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    throw new Error("Action réservée aux coachs et admins");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({
      rejected_by: current.userId,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason || null,
    })
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  revalidatePath("/evenements");
  revalidatePath(`/evenements/${eventId}`);
  revalidatePath("/validation");
}

export async function setRsvp(eventId: string, status: "going" | "maybe" | "not_going") {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase
    .from("event_rsvp")
    .upsert(
      {
        event_id: eventId,
        user_id: current.userId,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id,user_id" }
    );

  if (error) throw new Error(error.message);
  revalidatePath(`/evenements/${eventId}`);
}

export async function toggleCheckIn(eventId: string, userId: string, checkedIn: boolean) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    throw new Error("Action réservée aux coachs et admins");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("event_rsvp")
    .update({ checked_in: checkedIn, checked_in_by: current.userId })
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath(`/evenements/${eventId}`);
}
