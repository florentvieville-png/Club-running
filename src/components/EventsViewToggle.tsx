"use client";

import { useState, type ReactNode } from "react";
import { EventCalendar } from "@/components/EventCalendar";
import type { EventWithCreator } from "@/lib/types/database";

export function EventsViewToggle({
  listContent,
  calendarEvents,
}: {
  listContent: ReactNode;
  calendarEvents: EventWithCreator[];
}) {
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-fit gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
        <button
          onClick={() => setView("list")}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            view === "list"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-500"
          }`}
        >
          Liste
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            view === "calendar"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-500"
          }`}
        >
          Calendrier
        </button>
      </div>

      {view === "list" ? listContent : <EventCalendar events={calendarEvents} />}
    </div>
  );
}
