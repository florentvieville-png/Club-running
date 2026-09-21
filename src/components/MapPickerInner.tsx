"use client";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

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

// Recentre la carte quand la position change depuis l'extérieur (ex : géocodage d'adresse),
// car la prop `center` de MapContainer ne s'applique qu'au montage initial.
function RecenterOnChange({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 14);
    }
  }, [position, map]);
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
  // Suit les props précédentes pour recentrer la carte quand l'adresse est
  // géocodée depuis l'extérieur (ajustement pendant le rendu, pas dans un effet).
  const [trackedLat, setTrackedLat] = useState(initialLat);
  const [trackedLng, setTrackedLng] = useState(initialLng);
  if (initialLat !== trackedLat || initialLng !== trackedLng) {
    setTrackedLat(initialLat);
    setTrackedLng(initialLng);
    if (initialLat != null && initialLng != null) {
      setPosition([initialLat, initialLng]);
    }
  }

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
        <RecenterOnChange position={position} />
        {position && <Marker position={position} icon={pinIcon} />}
      </MapContainer>
      <p className="text-xs text-zinc-500">
        Cliquez sur la carte pour ajuster le point de rendez-vous.
        {position && ` Sélection : ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`}
      </p>
    </div>
  );
}
