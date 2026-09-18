"use client";

import dynamic from "next/dynamic";

const EventMapInner = dynamic(() => import("./EventMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-xl bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-900">
      Chargement de la carte...
    </div>
  ),
});

export function EventMap(props: { latitude: number; longitude: number; label?: string }) {
  return <EventMapInner {...props} />;
}
