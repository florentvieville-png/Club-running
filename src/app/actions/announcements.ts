"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AnnouncementState = { error?: string };

export async function createAnnouncement(
  _prevState: AnnouncementState,
  formData: FormData
): Promise<AnnouncementState> {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    return { error: "Réservé aux coachs et admins" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const pinned = formData.get("pinned") === "on";

  if (title.length < 3 || content.length < 3) {
    return { error: "Titre et message requis" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .insert({ title, content, pinned, created_by: current.userId });

  if (error) return { error: error.message };

  revalidatePath("/");
  return {};
}

export async function deleteAnnouncement(id: string) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    throw new Error("Réservé aux coachs et admins");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
