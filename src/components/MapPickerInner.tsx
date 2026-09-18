"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";

const pinIcon = L.divIcon({
  html: '<div style="font-size:28px;line-height:1;transform:translate(-50%,-90%)">📍</div>',
  className: "",
  iconSize: [0, 0],
});

// Centre par défaut : à ajuster à la ville du club si besoin.
const DEFAULT_CENTER: [number, number] = [46.6034, 1.8883];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPickerInner({
  initialLat,
  initialLng,
  onChange,
}: {
  initialLat: number | null;
  initialLng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat != null && initialLng != null ? [initialLat, initialLng] : null
  );

  function handlePick(lat: number, lng: number) {
    setPosition([lat, lng]);
    onChange(lat, lng);
  }

  return (
    <div className="flex flex-col gap-2">
      <MapContainer
        center={position ?? DEFAULT_CENTER}
        zoom={position ? 14 : 5}
        scrollWheelZoom={false}
        className="h-64 w-full rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={handlePick} />
        {position && <Marker position={position} icon={pinIcon} />}
      </MapContainer>
      <p className="text-xs text-zinc-500">
        Cliquez sur la carte pour placer le point de rendez-vous.
        {position && ` Sélection : ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`}
      </p>
    </div>
  );
}
