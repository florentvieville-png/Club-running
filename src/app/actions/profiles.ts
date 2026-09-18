"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/lib/types/database";

export async function updateOwnProfile(formData: FormData) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const full_name = String(formData.get("full_name") ?? "").trim();
  const pace_group = String(formData.get("pace_group") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: full_name || current.profile.full_name,
      pace_group: pace_group || null,
      phone: phone || null,
    })
    .eq("id", current.userId);

  if (error) throw new Error(error.message);
  revalidatePath("/membres");
}

export async function updateMemberRole(memberId: string, role: UserRole) {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin") {
    throw new Error("Réservé aux admins");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath("/membres");
}
