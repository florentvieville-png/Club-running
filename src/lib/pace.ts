export function targetSpeedKmh(vmaKmh: number, vmaPct: number): number {
  return (vmaKmh * vmaPct) / 100;
}

// Convertit une vitesse (km/h) en allure "m:ss /km"
export function speedToPace(speedKmh: number): string {
  if (!speedKmh || speedKmh <= 0) return "—";
  const secondsPerKm = 3600 / speedKmh;
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")} /km`;
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes == null) return "";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}
