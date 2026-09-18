import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { EVENT_TYPE_LABELS, type EventWithCreator } from "@/lib/types/database";
import { ApprovalActions } from "@/components/ApprovalActions";

export default async function ValidationPage() {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");
  if (current.profile.role !== "admin" && current.profile.role !== "coach") {
    redirect("/");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*, creator:profiles!events_created_by_fkey(id, full_name)")
    .eq("status", "pending")
    .order("starts_at", { ascending: true });

  const pending = (data ?? []) as unknown as EventWithCreator[];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">File de validation</h1>
      <p className="text-sm text-zinc-500">
        Chaque événement proposé par un coureur doit être validé par un admin
        et par un coach avant d&apos;être visible pour tout le club.
      </p>

      {pending.length === 0 && (
        <p className="text-sm text-zinc-400">Aucun événement en attente.</p>
      )}

      <div className="flex flex-col gap-4">
        {pending.map((event) => (
          <div key={event.id} className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <Link href={`/evenements/${event.id}`} className="font-medium hover:underline">
                {event.title}
              </Link>
              <span className="text-xs text-zinc-400">{EVENT_TYPE_LABELS[event.type]}</span>
            </div>
            <p className="text-xs text-zinc-500">
              {new Date(event.starts_at).toLocaleString("fr-FR")} · Proposé par{" "}
              {event.creator?.full_name ?? "un membre"}
            </p>
            <ApprovalActions
              eventId={event.id}
              role={current.profile.role}
              adminApproved={!!event.admin_approved_at}
              coachApproved={!!event.coach_approved_at}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
