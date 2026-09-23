-- Migration : modification/suppression d'événements par le créateur/coach/admin,
-- quantité + nouveaux statuts pour les réservations boutique.
-- À exécuter dans l'éditeur SQL de votre projet Supabase.

-- Le créateur d'un événement (ou un coach/admin) peut désormais le modifier
-- ou le supprimer, même après validation (auparavant limité au statut "pending").
drop policy if exists "events_update" on public.events;
create policy "events_update" on public.events
  for update to authenticated
  using (created_by = auth.uid() or public.is_coach())
  with check (created_by = auth.uid() or public.is_coach());

create policy "events_delete" on public.events
  for delete to authenticated
  using (created_by = auth.uid() or public.is_coach());

-- Quantité demandée par réservation boutique.
alter table public.shop_reservations add column quantity integer not null default 1;

-- Nouveaux statuts de suivi des demandes boutique (en plus de pending/fulfilled/cancelled).
alter type shop_reservation_status add value if not exists 'enregistree';
alter type shop_reservation_status add value if not exists 'en_cours';
alter type shop_reservation_status add value if not exists 'payee';
alter type shop_reservation_status add value if not exists 'terminee';
