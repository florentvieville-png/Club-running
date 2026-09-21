export type GeocodeResult = { lat: number; lng: number; label: string };

// Géocodage gratuit via l'API publique OpenStreetMap Nominatim (sans clé API).
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=0&q=${encodeURIComponent(
    trimmed
  )}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  const first = results[0];
  if (!first) return null;

  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon), label: first.display_name };
}
