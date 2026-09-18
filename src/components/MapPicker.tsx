"use client";

import dynamic from "next/dynamic";

const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-xl bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-900">
      Chargement de la carte...
    </div>
  ),
});

export function MapPicker(props: {
  initialLat: number | null;
  initialLng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  return <MapPickerInner {...props} />;
}
