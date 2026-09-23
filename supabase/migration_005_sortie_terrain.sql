-- Migration : type d'événement "sortie", terrain, niveau de difficulté,
-- et correction de la durée d'une répétition (minutes -> secondes).
-- À exécuter dans l'éditeur SQL de votre projet Supabase.

-- Nouveau type d'événement "sortie".
alter type event_type add value if not exists 'sortie';

-- Terrain (applicable à tous les types sauf "autre") et niveau de difficulté
-- (utilisé pour les sorties).
create type terrain_type as enum ('route', 'chemin', 'trail');
create type difficulty_level as enum ('debutant', 'intermediaire', 'confirme');

alter table public.events add column terrain terrain_type;
alter table public.events add column difficulty difficulty_level;

-- La durée d'une répétition était stockée en minutes (ex : 0.5 pour 30s),
-- ce qui donnait un affichage peu lisible ("0.5 min"). On migre vers des
-- secondes, cohérent avec le repos entre répétitions.
alter table public.events add column rep_time_seconds integer;
update public.events
  set rep_time_seconds = round(rep_time_minutes * 60)
  where rep_time_minutes is not null;
alter table public.events drop column rep_time_minutes;
