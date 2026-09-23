import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { EventCard } from "@/components/EventCard";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { DeleteAnnouncementButton } from "@/components/DeleteAnnouncementButton";
import { SocialLinks } from "@/components/SocialLinks";
import {
  CalendarIcon,
  ShopIcon,
  UserIcon,
  RunIcon,
  ChevronRightIcon,
  LocationPinIcon,
} from "@/components/icons";
import { EVENT_TYPE_LABELS, type Announcement, type EventWithCreator } from "@/lib/types/database";

const TILES = [
  { href: "/evenements?view=calendar", label: "Événements", sub: "Voir le calendrier", icon: CalendarIcon },
  { href: "/evenements?type=seance", label: "Séances", sub: "Le programme", icon: RunIcon },
  { href: "/membres", label: "Adhérents", sub: "L'annuaire du club", icon: UserIcon },
  { href: "/boutique", label: "Boutique", sub: "Équipements du club", icon: ShopIcon },
];

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
  const nextEvent = events[0];
  const firstName = current.profile.full_name.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue-dark to-brand-blue px-5 py-5 text-white">
        <Image
          src="/icons/logo-64.png"
          alt="La Loriolade"
          width={44}
          height={44}
          className="shrink-0 rounded-full"
        />
        <div>
          <h1 className="text-xl font-bold">Bonjour {firstName} 👋</h1>
          <p className="mt-0.5 text-sm text-white/80">Voici ce qui se passe au club en ce moment.</p>
        </div>
      </div>

      {nextEvent && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Prochain rendez-vous
          </h2>
          <Link
            href={`/evenements/${nextEvent.id}`}
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white">
              <RunIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-500">{EVENT_TYPE_LABELS[nextEvent.type]}</p>
              <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">{nextEvent.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {new Date(nextEvent.starts_at).toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                {" · "}
                {new Date(nextEvent.starts_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {nextEvent.location_name && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                  <LocationPinIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{nextEvent.location_name}</span>
                </p>
              )}
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-zinc-300" />
          </Link>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
              <tile.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {tile.label}
              </span>
              <span className="block truncate text-xs text-zinc-500">{tile.sub}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Prochains rendez-vous
          </h2>
          <Link
            href="/evenements"
            className="flex items-center gap-0.5 text-sm font-medium text-brand-blue-dark dark:text-blue-300"
          >
            Voir tout <ChevronRightIcon className="h-4 w-4" />
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
        {events.slice(nextEvent ? 1 : 0).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Actualités
        </h2>
        {isReviewer && <AnnouncementForm />}
        {announcements.length === 0 && (
          <p className="text-sm text-zinc-400">Aucune annonce pour l&apos;instant.</p>
        )}
        <div className="flex flex-col gap-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 ${
                a.pinned
                  ? "border-brand-yellow/60 bg-brand-yellow/10 dark:border-brand-yellow/30"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
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

      <section className="flex flex-col gap-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Suivez le club
        </h2>
        <SocialLinks />
      </section>
    </div>
  );
}
