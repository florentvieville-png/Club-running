"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const percent = z.coerce.number().min(0).max(300);
const positiveNumber = z.coerce.number().positive();
const nonNegativeInt = z.coerce.number().int().min(0);

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
    // Courses
    distance_km: positiveNumber.optional(),
    duration_minutes: positiveNumber.optional(),
    elevation_gain_m: z.coerce.number().min(0).optional(),
    // Séances
    seance_type: z.string().trim().max(60).optional().or(z.literal("")),
    warmup_minutes: positiveNumber.optional(),
    warmup_vma_pct: percent.optional(),
    cooldown_minutes: positiveNumber.optional(),
    cooldown_vma_pct: percent.optional(),
    series_count: nonNegativeInt.optional(),
    reps_count: nonNegativeInt.optional(),
    rep_unit: z.enum(["time", "distance"]).optional(),
    rep_time_minutes: positiveNumber.optional(),
    rep_distance_m: positiveNumber.optional(),
    rep_elevation_m: z.coerce.number().min(0).optional(),
    rep_vma_pct: percent.optional(),
    rest_between_reps_seconds: nonNegativeInt.optional(),
    rest_between_series_minutes: z.coerce.number().min(0).optional(),
    rest_vma_pct: percent.optional(),
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

  const field = (name: string) => formData.get(name) || undefined;

  const raw = {
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    starts_at: formData.get("starts_at"),
    location_name: formData.get("location_name"),
    show_on_map: formData.get("show_on_map") === "on",
    latitude: field("latitude"),
    longitude: field("longitude"),
    external_link: formData.get("external_link") ?? "",
    distance_km: field("distance_km"),
    duration_minutes: field("duration_minutes"),
    elevation_gain_m: field("elevation_gain_m"),
    seance_type: formData.get("seance_type"),
    warmup_minutes: field("warmup_minutes"),
    warmup_vma_pct: field("warmup_vma_pct"),
    cooldown_minutes: field("cooldown_minutes"),
    cooldown_vma_pct: field("cooldown_vma_pct"),
    series_count: field("series_count"),
    reps_count: field("reps_count"),
    rep_unit: field("rep_unit"),
    rep_time_minutes: field("rep_time_minutes"),
    rep_distance_m: field("rep_distance_m"),
    rep_elevation_m: field("rep_elevation_m"),
    rep_vma_pct: field("rep_vma_pct"),
    rest_between_reps_seconds: field("rest_between_reps_seconds"),
    rest_between_series_minutes: field("rest_between_series_minutes"),
    rest_vma_pct: field("rest_vma_pct"),
  };

  const parsed = createEventSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const fieldPath = issue?.path?.join(".");
    const detail = fieldPath ? `Champ "${fieldPath}" : ${issue.message}` : issue?.message;
    return { error: detail ?? "Formulaire invalide" };
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
      duration_minutes: parsed.data.duration_minutes ?? null,
      elevation_gain_m: parsed.data.elevation_gain_m ?? null,
      seance_type: parsed.data.seance_type || null,
      warmup_minutes: parsed.data.warmup_minutes ?? null,
      warmup_vma_pct: parsed.data.warmup_vma_pct ?? null,
      cooldown_minutes: parsed.data.cooldown_minutes ?? null,
      cooldown_vma_pct: parsed.data.cooldown_vma_pct ?? null,
      series_count: parsed.data.series_count ?? null,
      reps_count: parsed.data.reps_count ?? null,
      rep_unit: parsed.data.rep_unit ?? null,
      rep_time_minutes: parsed.data.rep_time_minutes ?? null,
      rep_distance_m: parsed.data.rep_distance_m ?? null,
      rep_elevation_m: parsed.data.rep_elevation_m ?? null,
      rep_vma_pct: parsed.data.rep_vma_pct ?? null,
      rest_between_reps_seconds: parsed.data.rest_between_reps_seconds ?? null,
      rest_between_series_minutes: parsed.data.rest_between_series_minutes ?? null,
      rest_vma_pct: parsed.data.rest_vma_pct ?? null,
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
