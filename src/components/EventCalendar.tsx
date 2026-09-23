"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EVENT_TYPE_LABELS, type EventWithCreator } from "@/lib/types/database";

const DOT_COLOR: Record<string, string> = {
  seance: "bg-brand-blue",
  course: "bg-brand-orange",
  sortie: "bg-emerald-500",
  autre: "bg-zinc-400",
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  // Lundi = 0 ... Dimanche = 6
  const leadingOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - leadingOffset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return days;
}

export function EventCalendar({ events }: { events: EventWithCreator[] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventWithCreator[]>();
    for (const event of events) {
      const key = dateKey(new Date(event.starts_at));
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const days = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const todayKey = dateKey(new Date());
  const selectedEvents = selectedKey ? eventsByDay.get(selectedKey) ?? [] : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          ‹
        </button>
        <p className="text-sm font-semibold capitalize">
          {cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-400">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = dateKey(day);
          const inMonth = day.getMonth() === cursor.getMonth();
          const dayEvents = eventsByDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          return (
            <button
              key={key}
              onClick={() => setSelectedKey(isSelected ? null : key)}
              disabled={dayEvents.length === 0}
              className={`flex aspect-square flex-col items-center justify-start gap-1 rounded-lg p-1 text-xs transition-colors ${
                inMonth ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-300 dark:text-zinc-700"
              } ${isSelected ? "bg-orange-100 dark:bg-orange-950" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isToday ? "bg-brand-orange text-white" : ""
                }`}
              >
                {day.getDate()}
              </span>
              <span className="flex gap-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR[e.type]}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {selectedKey && (
        <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {new Date(selectedKey).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          {selectedEvents.length === 0 && (
            <p className="text-sm text-zinc-400">Aucun événement ce jour-là.</p>
          )}
          {selectedEvents.map((event) => (
            <Link
              key={event.id}
              href={`/evenements/${event.id}`}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${DOT_COLOR[event.type]}`} />
                {event.title}
              </span>
              <span className="text-xs text-zinc-400">
                {EVENT_TYPE_LABELS[event.type]} ·{" "}
                {new Date(event.starts_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
