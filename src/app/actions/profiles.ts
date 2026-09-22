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
  const vmaRaw = String(formData.get("vma_kmh") ?? "").trim();
  const vma_kmh = vmaRaw ? Number(vmaRaw) : null;

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

  if (vma_kmh != null && !Number.isNaN(vma_kmh)) {
    const { error: vmaError } = await supabase
      .from("athlete_vma")
      .upsert(
        { user_id: current.userId, vma_kmh, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    if (vmaError) throw new Error(vmaError.message);
  }

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
