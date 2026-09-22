import { speedToPace, targetSpeedKmh, formatMinutes } from "@/lib/pace";
import type { ClubEvent } from "@/lib/types/database";

function PhaseRow({
  label,
  detail,
  vmaPct,
  myVma,
}: {
  label: string;
  detail: string;
  vmaPct: number | null;
  myVma: number | null;
}) {
  if (!detail) return null;
  const speed = myVma && vmaPct ? targetSpeedKmh(myVma, vmaPct) : null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm dark:bg-zinc-900">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-zinc-500">{detail}</p>
      </div>
      {vmaPct != null && (
        <div className="text-right">
          <p className="text-xs text-zinc-400">{vmaPct}% VMA</p>
          {speed && (
            <p className="text-sm font-semibold text-brand-orange ">
              {speedToPace(speed)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function SeancePlanCard({ event, myVma }: { event: ClubEvent; myVma: number | null }) {
  const hasPlan =
    event.warmup_minutes != null ||
    event.reps_count != null ||
    event.series_count != null ||
    event.cooldown_minutes != null;

  if (!hasPlan) return null;

  const repDetail =
    event.rep_unit === "distance" && event.rep_distance_m
      ? `${event.rep_distance_m} m`
      : event.rep_time_minutes
        ? formatMinutes(event.rep_time_minutes)
        : "";

  const repsLine = [
    event.series_count ? `${event.series_count} série${event.series_count > 1 ? "s" : ""}` : null,
    event.reps_count ? `${event.reps_count} x ${repDetail}` : null,
    event.rep_elevation_m ? `${event.rep_elevation_m} m D+` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const restLine = [
    event.rest_between_reps_seconds ? `${event.rest_between_reps_seconds}s entre reps` : null,
    event.rest_between_series_minutes
      ? `${formatMinutes(event.rest_between_series_minutes)} entre séries`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Plan de la séance {event.seance_type && `— ${event.seance_type}`}
        </h2>
      </div>

      {!myVma && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Renseignez votre VMA dans votre profil (page Membres) pour voir vos allures cibles
          personnalisées.
        </p>
      )}

      <div className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
        <PhaseRow
          label="Échauffement"
          detail={event.warmup_minutes ? formatMinutes(event.warmup_minutes) : ""}
          vmaPct={event.warmup_vma_pct}
          myVma={myVma}
        />
        <PhaseRow label="Répétitions" detail={repsLine} vmaPct={event.rep_vma_pct} myVma={myVma} />
        <PhaseRow label="Repos" detail={restLine} vmaPct={event.rest_vma_pct} myVma={myVma} />
        <PhaseRow
          label="Retour au calme"
          detail={event.cooldown_minutes ? formatMinutes(event.cooldown_minutes) : ""}
          vmaPct={event.cooldown_vma_pct}
          myVma={myVma}
        />
      </div>
    </section>
  );
}
