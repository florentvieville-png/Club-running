"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createEvent, type CreateEventState } from "@/app/actions/events";
import { MapPicker } from "@/components/MapPicker";
import { geocodeAddress } from "@/lib/geocode";
import type { EventType } from "@/lib/types/database";

const initialState: CreateEventState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50 dark:bg-orange-500 dark:hover:bg-orange-600"
    >
      {pending ? "Envoi..." : "Proposer l'événement"}
    </button>
  );
}

export function EventForm() {
  const [state, formAction] = useActionState(createEvent, initialState);
  const [type, setType] = useState<EventType>("seance");
  const [showOnMap, setShowOnMap] = useState(false);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [locationName, setLocationName] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  async function handleLocate() {
    if (!locationName.trim()) return;
    setGeocoding(true);
    setGeocodeError(null);
    try {
      const result = await geocodeAddress(locationName);
      if (result) {
        setCoords({ lat: result.lat, lng: result.lng });
        setShowOnMap(true);
      } else {
        setGeocodeError("Adresse introuvable, essayez de préciser (ville, code postal...).");
      }
    } catch {
      setGeocodeError("Impossible de localiser cette adresse pour le moment.");
    } finally {
      setGeocoding(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
        Votre proposition sera visible par le bureau et devra être validée par
        un admin <strong>et</strong> un coach avant d&apos;apparaître pour tout
        le club.
      </p>

      <label className="flex flex-col gap-1 text-sm">
        Type d&apos;événement
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="seance">Séance d&apos;entraînement</option>
          <option value="course">Course</option>
          <option value="autre">Autre (sortie, réunion...)</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Titre
        <input
          name="title"
          required
          minLength={3}
          placeholder="Ex : Fractionné 10x400m"
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          name="description"
          rows={3}
          placeholder="Détails, allure, groupe concerné..."
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Date et heure
        <input
          type="datetime-local"
          name="starts_at"
          required
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {type === "course" && (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Distance (km)
            <input
              type="number"
              step="0.1"
              min="0"
              name="distance_km"
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Lien d&apos;inscription officiel
            <input
              type="url"
              name="external_link"
              placeholder="https://www.klikego.com/..."
              className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Lieu / point de rendez-vous (adresse ou description)
        <div className="flex gap-2">
          <input
            name="location_name"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Ex : Parking du stade municipal, Loriol-du-Comtat"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={handleLocate}
            disabled={geocoding || !locationName.trim()}
            className="whitespace-nowrap rounded-lg border border-orange-600 px-3 py-2 text-sm font-medium text-orange-700 disabled:opacity-50 dark:border-orange-500 dark:text-orange-400"
          >
            {geocoding ? "Recherche..." : "📍 Localiser"}
          </button>
        </div>
        {geocodeError && <span className="text-xs text-red-600 dark:text-red-400">{geocodeError}</span>}
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="show_on_map"
          checked={showOnMap}
          onChange={(e) => setShowOnMap(e.target.checked)}
          className="h-4 w-4"
        />
        Afficher le point de rendez-vous sur une carte
      </label>

      {showOnMap && (
        <>
          <MapPicker
            initialLat={coords.lat}
            initialLng={coords.lng}
            onChange={(lat, lng) => setCoords({ lat, lng })}
          />
          <input type="hidden" name="latitude" value={coords.lat ?? ""} />
          <input type="hidden" name="longitude" value={coords.lng ?? ""} />
        </>
      )}

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
