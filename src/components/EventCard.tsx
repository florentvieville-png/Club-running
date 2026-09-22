import Link from "next/link";
import { EVENT_TYPE_LABELS, type EventWithCreator } from "@/lib/types/database";
import { LocationPinIcon } from "@/components/icons";

const TYPE_DOT: Record<string, string> = {
  seance: "bg-brand-blue",
  course: "bg-brand-orange",
  autre: "bg-zinc-400",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  approved: "Validé",
  rejected: "Refusé",
};

export function EventCard({ event }: { event: EventWithCreator }) {
  const date = new Date(event.starts_at);
  const day = date.toLocaleDateString("fr-FR", { day: "2-digit" });
  const month = date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "").toUpperCase();

  return (
    <Link
      href={`/evenements/${event.id}`}
      className="flex items-stretch gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-blue-dark text-white">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-yellow">
          {month}
        </span>
        <span className="text-lg font-bold leading-none">{day}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${TYPE_DOT[event.type]}`} />
          <span className="text-xs font-medium text-zinc-500">{EVENT_TYPE_LABELS[event.type]}</span>
          {event.status !== "approved" && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[event.status]}`}>
              {STATUS_LABEL[event.status]}
            </span>
          )}
        </div>
        <h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-50">{event.title}</h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500">
          <span>
            {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {event.location_name && (
            <span className="flex min-w-0 items-center gap-1">
              <LocationPinIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
