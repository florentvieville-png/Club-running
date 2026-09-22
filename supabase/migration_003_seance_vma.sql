-- Migration : structure détaillée des séances + VMA personnelle
-- À exécuter dans le SQL Editor de Supabase, après schema.sql et migration_002_boutique.sql.

-- ============================================================
-- VMA : table séparée (pas une colonne sur profiles) pour que les règles de
-- sécurité s'appliquent ligne par ligne : seul le coureur concerné et les
-- coachs/admins peuvent lire une VMA donnée.
-- ============================================================
create table public.athlete_vma (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  vma_kmh numeric check (vma_kmh > 0 and vma_kmh < 30),
  updated_at timestamptz not null default now()
);

alter table public.athlete_vma enable row level security;

create policy "vma_select" on public.athlete_vma
  for select to authenticated using (user_id = auth.uid() or public.is_coach());

create policy "vma_insert_self" on public.athlete_vma
  for insert to authenticated with check (user_id = auth.uid());

create policy "vma_update_self" on public.athlete_vma
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- Structure détaillée des séances et infos complémentaires des courses
-- ============================================================
alter table public.events
  add column duration_minutes numeric,
  add column elevation_gain_m numeric,
  add column seance_type text,
  add column warmup_minutes numeric,
  add column warmup_vma_pct numeric,
  add column cooldown_minutes numeric,
  add column cooldown_vma_pct numeric,
  add column series_count integer,
  add column reps_count integer,
  add column rep_unit text check (rep_unit in ('time', 'distance')),
  add column rep_time_minutes numeric,
  add column rep_distance_m numeric,
  add column rep_elevation_m numeric,
  add column rep_vma_pct numeric,
  add column rest_between_reps_seconds integer,
  add column rest_between_series_minutes numeric,
  add column rest_vma_pct numeric;
