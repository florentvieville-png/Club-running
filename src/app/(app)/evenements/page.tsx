import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/EventCard";
import { EventsViewToggle } from "@/components/EventsViewToggle";
import type { EventWithCreator, EventType } from "@/lib/types/database";

const TABS: { value: EventType | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "seance", label: "Séances" },
  { value: "course", label: "Courses" },
  { value: "autre", label: "Autres" },
];

export default async function EventsPage(props: PageProps<"/evenements">) {
  const searchParams = await props.searchParams;
  const typeFilter = (Array.isArray(searchParams.type) ? searchParams.type[0] : searchParams.type) as
    | EventType
    | "all"
    | undefined;

  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  let upcomingQuery = supabase
    .from("events")
    .select("*, creator:profiles!events_created_by_fkey(id, full_name)")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true });
  let pastQuery = supabase
    .from("events")
    .select("*, creator:profiles!events_created_by_fkey(id, full_name)")
    .lt("starts_at", nowIso)
    .order("starts_at", { ascending: false });

  if (typeFilter && typeFilter !== "all") {
    upcomingQuery = upcomingQuery.eq("type", typeFilter);
    pastQuery = pastQuery.eq("type", typeFilter);
  }

  const [{ data: upcomingData, error }, { data: pastData }] = await Promise.all([
    upcomingQuery,
    pastQuery,
  ]);

  const upcoming = (upcomingData ?? []) as unknown as EventWithCreator[];
  const past = (pastData ?? []) as unknown as EventWithCreator[];
  const recentPast = past.slice(0, 10);

  const listContent = (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          À venir
        </h2>
        {upcoming.length === 0 && (
          <p className="text-sm text-zinc-400">Aucun événement à venir pour l&apos;instant.</p>
        )}
        {upcoming.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>

      {recentPast.length > 0 && (
        <section className="mt-6 flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Passés
          </h2>
          {recentPast.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Séances & courses</h1>
        <Link
          href="/evenements/nouveau"
          className="rounded-lg bg-brand-orange px-3 py-1.5 text-sm font-medium text-white hover:brightness-95  dark:hover:bg-brand-orange"
        >
          + Proposer
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/evenements" : `/evenements?type=${tab.value}`}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
              (typeFilter ?? "all") === tab.value
                ? "bg-brand-orange text-white "
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <EventsViewToggle listContent={listContent} calendarEvents={[...upcoming, ...past]} />
    </div>
  );
}
