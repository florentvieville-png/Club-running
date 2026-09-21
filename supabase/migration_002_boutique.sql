-- Migration : module Boutique (demandes de réservation, sans paiement en ligne)
-- À exécuter dans l'éditeur SQL de votre projet Supabase, après le schema.sql initial.

create type shop_reservation_status as enum ('pending', 'fulfilled', 'cancelled');

create table public.shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  price_label text,
  active boolean not null default true,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.shop_reservations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.shop_items (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  note text,
  status shop_reservation_status not null default 'pending',
  handled_by uuid references public.profiles (id),
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.shop_items enable row level security;
alter table public.shop_reservations enable row level security;

-- Articles : lecture pour tous les membres connectés, gestion réservée aux coach/admin.
create policy "shop_items_select" on public.shop_items
  for select to authenticated using (true);

create policy "shop_items_insert" on public.shop_items
  for insert to authenticated with check (public.is_coach());

create policy "shop_items_update" on public.shop_items
  for update to authenticated using (public.is_coach()) with check (public.is_coach());

create policy "shop_items_delete" on public.shop_items
  for delete to authenticated using (public.is_coach());

-- Réservations : chacun voit/crée les siennes ; coach/admin voient et traitent tout.
create policy "shop_reservations_select" on public.shop_reservations
  for select to authenticated using (user_id = auth.uid() or public.is_coach());

create policy "shop_reservations_insert" on public.shop_reservations
  for insert to authenticated with check (user_id = auth.uid());

create policy "shop_reservations_update" on public.shop_reservations
  for update to authenticated using (public.is_coach()) with check (public.is_coach());
