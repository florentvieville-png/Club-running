import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { EventCard } from "@/components/EventCard";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { DeleteAnnouncementButton } from "@/components/DeleteAnnouncementButton";
import type { Announcement, EventWithCreator } from "@/lib/types/database";

export default async function DashboardPage() {
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const supabase = await createClient();
  const isReviewer = current.profile.role === "admin" || current.profile.role === "coach";

  const [{ data: eventsData }, { data: announcementsData }] = await Promise.all([
    supabase
      .from("events")
      .select("*, creator:profiles!events_created_by_fkey(id, full_name)")
      .eq("status", "approved")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(4),
    supabase
      .from("announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const events = (eventsData ?? []) as unknown as EventWithCreator[];
  const announcements = (announcementsData ?? []) as Announcement[];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Bonjour {current.profile.full_name.split(" ")[0]} 👋</h1>
        <p className="text-sm text-zinc-500">Voici ce qui se passe au club en ce moment.</p>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Prochains rendez-vous
          </h2>
          <Link href="/evenements" className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Voir tout →
          </Link>
        </div>
        {events.length === 0 && (
          <p className="text-sm text-zinc-400">
            Aucun événement validé à venir.{" "}
            <Link href="/evenements/nouveau" className="underline">
              Proposez-en un
            </Link>
            .
          </p>
        )}
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Annonces du club
        </h2>
        {isReviewer && <AnnouncementForm />}
        {announcements.length === 0 && (
          <p className="text-sm text-zinc-400">Aucune annonce pour l&apos;instant.</p>
        )}
        <div className="flex flex-col gap-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                  {a.pinned && "📌 "}
                  {a.title}
                </p>
                {isReviewer && <DeleteAnnouncementButton id={a.id} />}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                {a.content}
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                {new Date(a.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
