import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { updateOwnProfile } from "@/app/actions/profiles";
import { Avatar } from "@/components/Avatar";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { MemberDirectory } from "@/components/MemberDirectory";
import type { Profile } from "@/lib/types/database";

export default async function MembersPage() {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("full_name");
  const members = (data ?? []) as Profile[];

  const { data: vmaRow } = await supabase
    .from("athlete_vma")
    .select("vma_kmh")
    .eq("user_id", current.userId)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-blue-dark to-brand-blue p-4 text-white">
          <Avatar name={current.profile.full_name} size={52} />
          <div>
            <p className="text-lg font-bold">{current.profile.full_name}</p>
            <p className="text-xs uppercase tracking-wide text-white/70">{current.profile.role}</p>
          </div>
        </div>
        <form action={updateOwnProfile} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <label className="flex flex-col gap-1 text-sm">
            Nom complet
            <input
              name="full_name"
              defaultValue={current.profile.full_name}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Groupe d&apos;allure
            <input
              name="pace_group"
              defaultValue={current.profile.pace_group ?? ""}
              placeholder="Ex : 5min/km, débutant, marathon..."
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Téléphone
            <input
              name="phone"
              defaultValue={current.profile.phone ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            VMA (km/h)
            <input
              name="vma_kmh"
              type="number"
              step="0.1"
              min="0"
              max="30"
              defaultValue={vmaRow?.vma_kmh ?? ""}
              placeholder="Ex : 16.5"
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <span className="text-xs text-zinc-400">
              Visible uniquement par vous et les coachs/admins. Utilisée pour calculer vos allures
              cibles dans les séances.
            </span>
          </label>
          <button
            type="submit"
            className="w-fit rounded-lg bg-brand-orange px-3 py-1.5 text-sm font-medium text-white hover:brightness-95  dark:hover:bg-brand-orange"
          >
            Enregistrer
          </button>
        </form>
        <ChangePasswordForm />
      </section>

      <MemberDirectory
        members={members}
        currentUserId={current.userId}
        isAdmin={current.profile.role === "admin"}
      />
    </div>
  );
}
