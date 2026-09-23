import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { EventMap } from "@/components/EventMap";
import { RsvpButtons } from "@/components/RsvpButtons";
import { ApprovalActions } from "@/components/ApprovalActions";
import { CheckInToggle } from "@/components/CheckInToggle";
import { EventChat } from "@/components/EventChat";
import { SeancePlanCard } from "@/components/SeancePlanCard";
import { EventActions } from "@/components/EventActions";
import {
  LocationPinIcon,
  ArrowLeftIcon,
  ClockIcon,
  RulerIcon,
  MountainIcon,
} from "@/components/icons";
import {
  EVENT_TYPE_LABELS,
  RSVP_LABELS,
  TERRAIN_LABELS,
  DIFFICULTY_LABELS,
  type EventWithCreator,
  type EventRsvp,
  type Profile,
  type RsvpStatus,
} from "@/lib/types/database";

type RsvpRow = EventRsvp & { profile: Pick<Profile, "id" | "full_name"> | null };

export default async function EventDetailPage(props: PageProps<"/evenements/[id]">) {
  const { id } = await props.params;
  const current = await getCurrentProfile();
  if (!current) return null;

  const supabase = await createClient();

  const { data: eventData } = await supabase
    .from("events")
    .select("*, creator:profiles!events_created_by_fkey(id, full_name)")
    .eq("id", id)
    .maybeSingle();

  if (!eventData) notFound();
  const event = eventData as unknown as EventWithCreator;

  const { data: rsvpData, error: rsvpError } = await supabase
    .from("event_rsvp")
    .select("*, profile:profiles!event_rsvp_user_id_fkey(id, full_name)")
    .eq("event_id", id);
  if (rsvpError) console.error("event_rsvp select failed:", rsvpError.message);

  const rsvps = (rsvpData ?? []) as unknown as RsvpRow[];
  const myRsvp = rsvps.find((r) => r.user_id === current.userId)?.status ?? null;
  const isReviewer = current.profile.role === "admin" || current.profile.role === "coach";
  const date = new Date(event.starts_at);

  const { data: vmaRow } = await supabase
    .from("athlete_vma")
    .select("vma_kmh")
    .eq("user_id", current.userId)
    .maybeSingle();
  const myVma = vmaRow?.vma_kmh ?? null;

  const grouped: Record<RsvpStatus, RsvpRow[]> = {
    going: rsvps.filter((r) => r.status === "going"),
    maybe: rsvps.filter((r) => r.status === "maybe"),
    not_going: rsvps.filter((r) => r.status === "not_going"),
  };

  const stats = [
    event.duration_minutes
      ? { label: "Durée", value: `${event.duration_minutes} min`, icon: ClockIcon }
      : null,
    event.distance_km ? { label: "Distance", value: `${event.distance_km} km`, icon: RulerIcon } : null,
    event.elevation_gain_m
      ? { label: "Dénivelé", value: `${event.elevation_gain_m} m D+`, icon: MountainIcon }
      : null,
  ].filter(Boolean) as { label: string; value: string; icon: typeof ClockIcon }[];

  const day = date.toLocaleDateString("fr-FR", { day: "2-digit" });
  const month = date
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div className="relative -mx-4 -mt-6 h-56 overflow-hidden sm:mx-0 sm:mt-0 sm:rounded-2xl">
        <Image
          src="/images/hero-trail.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
        <Link
          href="/evenements"
          aria-label="Retour"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-orange py-2 text-white">
          <span className="text-[10px] font-semibold uppercase">{month}</span>
          <span className="text-lg font-bold leading-none">{day}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5">
            <span className="w-fit rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-blue-dark dark:bg-brand-blue/20 dark:text-blue-300">
              {EVENT_TYPE_LABELS[event.type]}
            </span>
            {event.terrain && (
              <span className="w-fit rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                {TERRAIN_LABELS[event.terrain]}
              </span>
            )}
            {event.difficulty && (
              <span className="w-fit rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                {DIFFICULTY_LABELS[event.difficulty]}
              </span>
            )}
          </div>
          <h1 className="mt-1.5 text-xl font-bold text-zinc-900 dark:text-zinc-50">{event.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}
            {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          {event.location_name && (
            <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
              <LocationPinIcon className="h-4 w-4 shrink-0" /> {event.location_name}
            </p>
          )}
          {event.creator && (
            <p className="mt-1 text-xs text-zinc-400">Proposé par {event.creator.full_name}</p>
          )}
          {event.status === "approved" && (
            <p className="mt-1.5 w-fit rounded-full bg-brand-yellow/20 px-2.5 py-0.5 text-xs font-medium text-brand-blue-dark dark:text-brand-yellow">
              👥 {grouped.going.length} participant{grouped.going.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {(event.created_by === current.userId || isReviewer) && (
        <EventActions eventId={event.id} />
      )}

      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-2xl border border-zinc-200 bg-white py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <s.icon className="h-4 w-4 text-brand-blue-dark dark:text-blue-300" />
              <span className="text-sm font-bold text-brand-blue-dark dark:text-blue-300">{s.value}</span>
              <span className="text-[11px] text-zinc-500">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {event.external_link && (
        <a
          href={event.external_link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-sm font-medium text-brand-blue-dark underline dark:text-blue-300"
        >
          Inscription officielle →
        </a>
      )}

      {event.description && (
        <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {event.description}
        </p>
      )}

      {event.show_on_map && event.latitude != null && event.longitude != null && (
        <EventMap latitude={event.latitude} longitude={event.longitude} label={event.location_name ?? undefined} />
      )}

      {event.type === "seance" && <SeancePlanCard event={event} myVma={myVma} />}

      {event.status === "rejected" && (
        <p className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          Cet événement a été refusé{event.rejection_reason ? ` : ${event.rejection_reason}` : "."}
        </p>
      )}

      {event.status === "pending" && isReviewer && (
        <ApprovalActions
          eventId={event.id}
          role={current.profile.role}
          adminApproved={!!event.admin_approved_at}
          coachApproved={!!event.coach_approved_at}
        />
      )}

      {event.status === "pending" && !isReviewer && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          En attente de validation par le bureau (admin + coach).
        </p>
      )}

      {event.status === "approved" && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Votre participation
          </h2>
          <RsvpButtons eventId={event.id} current={myRsvp} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(["going", "maybe", "not_going"] as RsvpStatus[]).map((status) => (
              <div key={status} className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
                <p className="mb-2 text-xs font-semibold text-zinc-500">
                  {RSVP_LABELS[status]} ({grouped[status].length})
                </p>
                <ul className="flex flex-col gap-1">
                  {grouped[status].map((r) => (
                    <li key={r.user_id} className="flex items-center justify-between gap-2 text-sm">
                      <span>{r.profile?.full_name ?? "Membre"}</span>
                      {isReviewer && status === "going" && (
                        <CheckInToggle eventId={event.id} userId={r.user_id} checkedIn={r.checked_in} />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Discussion
        </h2>
        <EventChat eventId={event.id} currentUserId={current.userId} />
      </section>
    </div>
  );
}
