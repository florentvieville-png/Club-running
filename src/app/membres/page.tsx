import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { updateOwnProfile } from "@/app/actions/profiles";
import { RoleSelect } from "@/components/RoleSelect";
import type { Profile } from "@/lib/types/database";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  coach: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  runner: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
};

export default async function MembersPage() {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("full_name");
  const members = (data ?? []) as Profile[];

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Mon profil</h1>
        <form action={updateOwnProfile} className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
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
          <button
            type="submit"
            className="w-fit rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            Enregistrer
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Annuaire du club ({members.length})</h2>
        <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="text-sm font-medium">{member.full_name}</p>
                {member.pace_group && (
                  <p className="text-xs text-zinc-500">{member.pace_group}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[member.role]}`}>
                  {member.role}
                </span>
                {current.profile.role === "admin" && member.id !== current.userId && (
                  <RoleSelect memberId={member.id} role={member.role} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
