export type UserRole = "runner" | "coach" | "admin";
export type EventType = "seance" | "course" | "sortie" | "autre";
export type EventStatus = "pending" | "approved" | "rejected";
export type RsvpStatus = "going" | "maybe" | "not_going";
export type TerrainType = "route" | "chemin" | "trail";
export type DifficultyLevel = "debutant" | "intermediaire" | "confirme";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  pace_group: string | null;
  phone: string | null;
  created_at: string;
};

export type RepUnit = "time" | "distance";

export type ClubEvent = {
  id: string;
  type: EventType;
  title: string;
  description: string | null;
  starts_at: string;
  location_name: string | null;
  show_on_map: boolean;
  latitude: number | null;
  longitude: number | null;
  external_link: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  elevation_gain_m: number | null;
  terrain: TerrainType | null;
  difficulty: DifficultyLevel | null;
  seance_type: string | null;
  warmup_minutes: number | null;
  warmup_vma_pct: number | null;
  cooldown_minutes: number | null;
  cooldown_vma_pct: number | null;
  series_count: number | null;
  reps_count: number | null;
  rep_unit: RepUnit | null;
  rep_time_seconds: number | null;
  rep_distance_m: number | null;
  rep_elevation_m: number | null;
  rep_vma_pct: number | null;
  rest_between_reps_seconds: number | null;
  rest_between_series_minutes: number | null;
  rest_vma_pct: number | null;
  created_by: string;
  admin_approved_by: string | null;
  admin_approved_at: string | null;
  coach_approved_by: string | null;
  coach_approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  status: EventStatus;
};

export type EventWithCreator = ClubEvent & {
  creator: Pick<Profile, "id" | "full_name"> | null;
};

export type EventRsvp = {
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  checked_in: boolean;
  checked_in_by: string | null;
  updated_at: string;
};

export type EventMessage = {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type EventMessageWithAuthor = EventMessage & {
  author: Pick<Profile, "id" | "full_name"> | null;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  created_by: string;
  created_at: string;
};

export type ShopReservationStatus =
  | "pending"
  | "enregistree"
  | "en_cours"
  | "payee"
  | "terminee"
  | "fulfilled"
  | "cancelled";

export type ShopItem = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_label: string | null;
  active: boolean;
  created_by: string;
  created_at: string;
};

export type ShopReservation = {
  id: string;
  item_id: string;
  user_id: string;
  note: string | null;
  quantity: number;
  status: ShopReservationStatus;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
};

export type ShopReservationWithDetails = ShopReservation & {
  item: Pick<ShopItem, "id" | "name"> | null;
  member: Pick<Profile, "id" | "full_name"> | null;
};

export const SHOP_RESERVATION_LABELS: Record<ShopReservationStatus, string> = {
  pending: "À traiter",
  enregistree: "Enregistrée",
  en_cours: "En cours",
  payee: "Payée",
  terminee: "Terminée",
  fulfilled: "Remis",
  cancelled: "Annulée",
};

export const SHOP_RESERVATION_STATUS_OPTIONS: ShopReservationStatus[] = [
  "pending",
  "enregistree",
  "en_cours",
  "payee",
  "terminee",
  "cancelled",
];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  seance: "Séance",
  course: "Course",
  sortie: "Sortie",
  autre: "Autre",
};

export const TERRAIN_LABELS: Record<TerrainType, string> = {
  route: "Route",
  chemin: "Chemin",
  trail: "Trail",
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  confirme: "Confirmé",
};

export const RSVP_LABELS: Record<RsvpStatus, string> = {
  going: "Je viens",
  maybe: "Peut-être",
  not_going: "Absent",
};

export const SEANCE_TYPE_SUGGESTIONS = [
  "Fractionné",
  "Endurance fondamentale",
  "Sortie longue",
  "Récupération",
  "Côtes / Dénivelé",
  "Allure spécifique",
];

export type AthleteVma = {
  user_id: string;
  vma_kmh: number | null;
  updated_at: string;
};
