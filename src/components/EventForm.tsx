"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createEvent, updateEvent, type EventFormState } from "@/app/actions/events";
import { MapPicker } from "@/components/MapPicker";
import { geocodeAddress } from "@/lib/geocode";
import { SEANCE_TYPE_SUGGESTIONS, type ClubEvent, type EventType, type RepUnit } from "@/lib/types/database";

const TERRAIN_OPTIONS = [
  { value: "route", label: "Route" },
  { value: "chemin", label: "Chemin" },
  { value: "trail", label: "Trail" },
];

const DIFFICULTY_OPTIONS = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "confirme", label: "Confirmé" },
];

const initialState: EventFormState = {};

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50  dark:hover:bg-brand-orange"
    >
      {pending ? "Envoi..." : isEdit ? "Enregistrer les modifications" : "Proposer l'événement"}
    </button>
  );
}

export function EventForm({ event }: { event?: ClubEvent }) {
  const isEdit = !!event;
  const action = isEdit ? updateEvent.bind(null, event.id) : createEvent;
  const [state, formAction] = useActionState(action, initialState);
  const [type, setType] = useState<EventType>(event?.type ?? "seance");
  const [showOnMap, setShowOnMap] = useState(event?.show_on_map ?? false);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: event?.latitude ?? null,
    lng: event?.longitude ?? null,
  });
  const [locationName, setLocationName] = useState(event?.location_name ?? "");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [repUnit, setRepUnit] = useState<RepUnit>(event?.rep_unit ?? "time");

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

  const durationHours = event?.duration_minutes ? Math.floor(event.duration_minutes / 60) : "";
  const durationMins = event?.duration_minutes ? event.duration_minutes % 60 : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {!isEdit && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Votre proposition sera visible par le bureau et devra être validée par
          un admin <strong>et</strong> un coach avant d&apos;apparaître pour tout
          le club.
        </p>
      )}

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
          <option value="sortie">Sortie</option>
          <option value="autre">Autre (réunion...)</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Titre
        <input
          name="title"
          required
          minLength={3}
          defaultValue={event?.title}
          placeholder="Ex : Fractionné 10x400m"
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          name="description"
          rows={3}
          defaultValue={event?.description ?? ""}
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
          defaultValue={event ? toLocalDatetimeValue(event.starts_at) : undefined}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {(type === "course" || type === "sortie") && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm">
              Distance (km)
              <input
                type="number"
                step="0.1"
                min="0"
                name="distance_km"
                defaultValue={event?.distance_km ?? ""}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Dénivelé (m)
              <input
                type="number"
                step="1"
                min="0"
                name="elevation_gain_m"
                defaultValue={event?.elevation_gain_m ?? ""}
                className={inputClass}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Durée
            <span className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                min="0"
                name="duration_hours"
                defaultValue={durationHours}
                placeholder="h"
                className={`w-full ${inputClass}`}
              />
              <span className="text-zinc-400">h</span>
              <input
                type="number"
                step="1"
                min="0"
                max="59"
                name="duration_mins"
                defaultValue={durationMins}
                placeholder="min"
                className={`w-full ${inputClass}`}
              />
              <span className="text-zinc-400">min</span>
            </span>
          </label>

          {type === "sortie" && (
            <label className="flex flex-col gap-1 text-sm">
              Niveau
              <select name="difficulty" defaultValue={event?.difficulty ?? ""} className={inputClass}>
                <option value="">Non précisé</option>
                {DIFFICULTY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {type === "course" && (
            <label className="flex flex-col gap-1 text-sm">
              Lien d&apos;inscription officiel
              <input
                type="url"
                name="external_link"
                defaultValue={event?.external_link ?? ""}
                placeholder="https://www.klikego.com/..."
                className={inputClass}
              />
            </label>
          )}
        </>
      )}

      {type !== "autre" && (
        <label className="flex flex-col gap-1 text-sm">
          Type de terrain
          <select name="terrain" defaultValue={event?.terrain ?? ""} className={inputClass}>
            <option value="">Non précisé</option>
            {TERRAIN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {type === "seance" && (
        <div className="flex flex-col gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <label className="flex flex-col gap-1 text-sm">
            Type de séance
            <input
              name="seance_type"
              list="seance-type-suggestions"
              defaultValue={event?.seance_type ?? ""}
              placeholder="Ex : Fractionné"
              className={inputClass}
            />
            <datalist id="seance-type-suggestions">
              {SEANCE_TYPE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Échauffement
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-sm">
                Durée (min)
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="warmup_minutes"
                  defaultValue={event?.warmup_minutes ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                % VMA
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="warmup_vma_pct"
                  defaultValue={event?.warmup_vma_pct ?? ""}
                  className={inputClass}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Corps de séance
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-sm">
                Nombre de séries
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="series_count"
                  defaultValue={event?.series_count ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Répétitions par série
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="reps_count"
                  defaultValue={event?.reps_count ?? ""}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              Chaque répétition en
              <select
                name="rep_unit"
                value={repUnit}
                onChange={(e) => setRepUnit(e.target.value as RepUnit)}
                className={inputClass}
              >
                <option value="time">Temps</option>
                <option value="distance">Distance</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {repUnit === "time" ? (
                <label className="flex flex-col gap-1 text-sm">
                  Durée d&apos;une répétition (s)
                  <input
                    type="number"
                    step="5"
                    min="0"
                    name="rep_time_seconds"
                    defaultValue={event?.rep_time_seconds ?? ""}
                    className={inputClass}
                  />
                </label>
              ) : (
                <label className="flex flex-col gap-1 text-sm">
                  Distance d&apos;une répétition (m)
                  <input
                    type="number"
                    step="10"
                    min="0"
                    name="rep_distance_m"
                    defaultValue={event?.rep_distance_m ?? ""}
                    className={inputClass}
                  />
                </label>
              )}
              <label className="flex flex-col gap-1 text-sm">
                % VMA en répétition
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="rep_vma_pct"
                  defaultValue={event?.rep_vma_pct ?? ""}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              Dénivelé par répétition (m, optionnel)
              <input
                type="number"
                step="1"
                min="0"
                name="rep_elevation_m"
                defaultValue={event?.rep_elevation_m ?? ""}
                className={inputClass}
              />
            </label>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Repos
            </legend>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex flex-col gap-1 text-sm">
                Entre répétitions (s)
                <input
                  type="number"
                  step="5"
                  min="0"
                  name="rest_between_reps_seconds"
                  defaultValue={event?.rest_between_reps_seconds ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Entre séries (min)
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  name="rest_between_series_minutes"
                  defaultValue={event?.rest_between_series_minutes ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                % VMA au repos
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="rest_vma_pct"
                  defaultValue={event?.rest_vma_pct ?? ""}
                  className={inputClass}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Retour au calme
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-sm">
                Durée (min)
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="cooldown_minutes"
                  defaultValue={event?.cooldown_minutes ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                % VMA
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="cooldown_vma_pct"
                  defaultValue={event?.cooldown_vma_pct ?? ""}
                  className={inputClass}
                />
              </label>
            </div>
          </fieldset>
        </div>
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
            className="whitespace-nowrap rounded-lg border border-brand-orange px-3 py-2 text-sm font-medium text-brand-orange disabled:opacity-50  "
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

      <SubmitButton isEdit={isEdit} />
    </form>
  );
}
