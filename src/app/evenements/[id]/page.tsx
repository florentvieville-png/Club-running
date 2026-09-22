import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { EventMap } from "@/components/EventMap";
import { RsvpButtons } from "@/components/RsvpButtons";
import { ApprovalActions } from "@/components/ApprovalActions";
import { CheckInToggle } from "@/components/CheckInToggle";
import { EventChat } from "@/components/EventChat";
import { SeancePlanCard } from "@/components/SeancePlanCard";
import {
  EVENT_TYPE_LABELS,
  RSVP_LABELS,
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

  const { data: rsvpData } = await supabase
    .from("event_rsvp")
    .select("*, profile:profiles(id, full_name)")
    .eq("event_id", id);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
          {EVENT_TYPE_LABELS[event.type]}
        </span>
        <h1 className="text-2xl font-semibold">{event.title}</h1>
        <p className="text-sm text-zinc-500">
          {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {" à "}
          {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
        {event.location_name && <p className="text-sm text-zinc-500">📍 {event.location_name}</p>}
        {(event.distance_km || event.duration_minutes || event.elevation_gain_m) && (
          <p className="text-sm text-zinc-500">
            {[
              event.distance_km ? `📏 ${event.distance_km} km` : null,
              event.duration_minutes ? `⏱️ ${event.duration_minutes} min` : null,
              event.elevation_gain_m ? `⛰️ ${event.elevation_gain_m} m D+` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {event.external_link && (
          <a
            href={event.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm font-medium text-blue-600 underline dark:text-blue-400"
          >
            Inscription officielle →
          </a>
        )}
        {event.creator && (
          <p className="text-xs text-zinc-400">Proposé par {event.creator.full_name}</p>
        )}
      </div>

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
        <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
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
        <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
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
              <div key={status} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
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
