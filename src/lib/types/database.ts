export type UserRole = "runner" | "coach" | "admin";
export type EventType = "seance" | "course" | "autre";
export type EventStatus = "pending" | "approved" | "rejected";
export type RsvpStatus = "going" | "maybe" | "not_going";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  pace_group: string | null;
  phone: string | null;
  created_at: string;
};

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

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  seance: "Séance",
  course: "Course",
  autre: "Autre",
};

export const RSVP_LABELS: Record<RsvpStatus, string> = {
  going: "Je viens",
  maybe: "Peut-être",
  not_going: "Absent",
};
