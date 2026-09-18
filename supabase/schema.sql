-- Schema pour l'application du club de course à pied
-- À exécuter dans l'éditeur SQL de votre projet Supabase (https://app.supabase.com)

create extension if not exists "pgcrypto";

-- ============================================================
-- Types
-- ============================================================
create type user_role as enum ('runner', 'coach', 'admin');
create type event_type as enum ('seance', 'course', 'autre');
create type event_status as enum ('pending', 'approved', 'rejected');
create type rsvp_status as enum ('going', 'maybe', 'not_going');

-- ============================================================
-- Profils (1 ligne par utilisateur Supabase Auth)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role user_role not null default 'runner',
  pace_group text,
  phone text,
  created_at timestamptz not null default now()
);

-- Crée automatiquement un profil "runner" à l'inscription
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'runner'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fonctions utilitaires (security definer pour éviter la récursion RLS)
create function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.is_coach()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('coach', 'admin'));
$$;

-- ============================================================
-- Événements (séance, course, autre)
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  type event_type not null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  location_name text,
  show_on_map boolean not null default false,
  latitude double precision,
  longitude double precision,
  external_link text,
  distance_km numeric,
  created_by uuid not null references public.profiles (id),
  admin_approved_by uuid references public.profiles (id),
  admin_approved_at timestamptz,
  coach_approved_by uuid references public.profiles (id),
  coach_approved_at timestamptz,
  rejected_by uuid references public.profiles (id),
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  status event_status generated always as (
    case
      when rejected_at is not null then 'rejected'
      when admin_approved_at is not null and coach_approved_at is not null then 'approved'
      else 'pending'
    end
  ) stored,
  constraint show_on_map_needs_coords check (
    show_on_map = false or (latitude is not null and longitude is not null)
  )
);

-- Si le créateur est déjà coach et/ou admin, sa propre validation est acquise
-- automatiquement (il reste besoin de la validation de l'autre rôle).
create function public.set_auto_approval()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  creator_role user_role;
begin
  select role into creator_role from public.profiles where id = new.created_by;

  if creator_role = 'admin' then
    new.admin_approved_by := new.created_by;
    new.admin_approved_at := now();
  elsif creator_role = 'coach' then
    new.coach_approved_by := new.created_by;
    new.coach_approved_at := now();
  end if;

  return new;
end;
$$;

create trigger events_auto_approval
  before insert on public.events
  for each row execute function public.set_auto_approval();

-- ============================================================
-- Présences / RSVP
-- ============================================================
create table public.event_rsvp (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status rsvp_status not null,
  checked_in boolean not null default false,
  checked_in_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ============================================================
-- Chat par événement
-- ============================================================
create table public.event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Annonces du club
-- ============================================================
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  pinned boolean not null default false,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvp enable row level security;
alter table public.event_messages enable row level security;
alter table public.announcements enable row level security;

-- Profiles : tout le monde connecté peut consulter l'annuaire ;
-- chacun modifie sa propre fiche ; un admin peut modifier n'importe quelle fiche (rôles).
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Events : visibles si approuvés, si créés par soi, ou si on est coach/admin (file de validation).
create policy "events_select" on public.events
  for select to authenticated using (
    status = 'approved' or created_by = auth.uid() or public.is_coach()
  );

create policy "events_insert" on public.events
  for insert to authenticated with check (created_by = auth.uid());

-- Le créateur peut éditer son événement tant qu'il est en attente ;
-- coach/admin peuvent modifier (validation, rejet) n'importe quel événement.
create policy "events_update" on public.events
  for update to authenticated
  using ((created_by = auth.uid() and status = 'pending') or public.is_coach())
  with check ((created_by = auth.uid() and status = 'pending') or public.is_coach());

-- RSVP : visible pour tout le monde pouvant voir l'événement ; chacun gère sa propre ligne.
create policy "rsvp_select" on public.event_rsvp
  for select to authenticated using (
    exists (
      select 1 from public.events e
      where e.id = event_rsvp.event_id
        and (e.status = 'approved' or e.created_by = auth.uid() or public.is_coach())
    )
  );

create policy "rsvp_upsert_self" on public.event_rsvp
  for insert to authenticated with check (user_id = auth.uid());

create policy "rsvp_update_self_or_coach" on public.event_rsvp
  for update to authenticated
  using (user_id = auth.uid() or public.is_coach())
  with check (user_id = auth.uid() or public.is_coach());

-- Messages : mêmes règles de visibilité que l'événement ; chacun poste en son nom.
create policy "messages_select" on public.event_messages
  for select to authenticated using (
    exists (
      select 1 from public.events e
      where e.id = event_messages.event_id
        and (e.status = 'approved' or e.created_by = auth.uid() or public.is_coach())
    )
  );

create policy "messages_insert" on public.event_messages
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.events e
      where e.id = event_messages.event_id
        and (e.status = 'approved' or e.created_by = auth.uid() or public.is_coach())
    )
  );

-- Annonces : lecture pour tous, écriture réservée aux coach/admin.
create policy "announcements_select" on public.announcements
  for select to authenticated using (true);

create policy "announcements_insert" on public.announcements
  for insert to authenticated with check (public.is_coach());

create policy "announcements_delete" on public.announcements
  for delete to authenticated using (public.is_coach());

-- ============================================================
-- Realtime (chat en direct)
-- ============================================================
alter publication supabase_realtime add table public.event_messages;
