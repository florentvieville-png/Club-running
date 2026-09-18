import Link from "next/link";
import { EVENT_TYPE_LABELS, type EventWithCreator } from "@/lib/types/database";

const TYPE_BADGE: Record<string, string> = {
  seance: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  course: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  autre: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente de validation",
  approved: "Validé",
  rejected: "Refusé",
};

export function EventCard({ event }: { event: EventWithCreator }) {
  const date = new Date(event.starts_at);

  return (
    <Link
      href={`/evenements/${event.id}`}
      className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[event.type]}`}>
          {EVENT_TYPE_LABELS[event.type]}
        </span>
        {event.status !== "approved" && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[event.status]}`}>
            {STATUS_LABEL[event.status]}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{event.title}</h3>
      <p className="text-sm text-zinc-500">
        {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        {" · "}
        {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </p>
      {event.location_name && (
        <p className="text-sm text-zinc-500">📍 {event.location_name}</p>
      )}
      {event.creator && (
        <p className="text-xs text-zinc-400">Proposé par {event.creator.full_name}</p>
      )}
    </Link>
  );
}
