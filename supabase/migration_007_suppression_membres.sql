-- Migration : permet la suppression complète d'un compte membre (profil +
-- authentification) sans être bloqué par les événements/articles/annonces
-- qu'il a créés, ni par les actions (validation, remise, check-in) qu'il a
-- effectuées. Ces références deviennent NULL au lieu de bloquer la
-- suppression — l'historique du club (événements, articles, annonces)
-- est conservé, seul le nom du créateur/valideur disparaît.
-- À exécuter dans l'éditeur SQL de votre projet Supabase.

-- events.created_by
alter table public.events alter column created_by drop not null;
alter table public.events drop constraint events_created_by_fkey;
alter table public.events
  add constraint events_created_by_fkey
  foreign key (created_by) references public.profiles (id) on delete set null;

-- events.admin_approved_by / coach_approved_by / rejected_by
alter table public.events drop constraint events_admin_approved_by_fkey;
alter table public.events
  add constraint events_admin_approved_by_fkey
  foreign key (admin_approved_by) references public.profiles (id) on delete set null;

alter table public.events drop constraint events_coach_approved_by_fkey;
alter table public.events
  add constraint events_coach_approved_by_fkey
  foreign key (coach_approved_by) references public.profiles (id) on delete set null;

alter table public.events drop constraint events_rejected_by_fkey;
alter table public.events
  add constraint events_rejected_by_fkey
  foreign key (rejected_by) references public.profiles (id) on delete set null;

-- event_rsvp.checked_in_by
alter table public.event_rsvp drop constraint event_rsvp_checked_in_by_fkey;
alter table public.event_rsvp
  add constraint event_rsvp_checked_in_by_fkey
  foreign key (checked_in_by) references public.profiles (id) on delete set null;

-- shop_items.created_by
alter table public.shop_items alter column created_by drop not null;
alter table public.shop_items drop constraint shop_items_created_by_fkey;
alter table public.shop_items
  add constraint shop_items_created_by_fkey
  foreign key (created_by) references public.profiles (id) on delete set null;

-- shop_reservations.handled_by
alter table public.shop_reservations drop constraint shop_reservations_handled_by_fkey;
alter table public.shop_reservations
  add constraint shop_reservations_handled_by_fkey
  foreign key (handled_by) references public.profiles (id) on delete set null;

-- announcements.created_by
alter table public.announcements alter column created_by drop not null;
alter table public.announcements drop constraint announcements_created_by_fkey;
alter table public.announcements
  add constraint announcements_created_by_fkey
  foreign key (created_by) references public.profiles (id) on delete set null;
