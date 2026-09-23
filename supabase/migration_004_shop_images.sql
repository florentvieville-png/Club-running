-- Migration : stockage des photos d'articles boutique
-- À exécuter dans le SQL Editor de Supabase, après les migrations précédentes.

insert into storage.buckets (id, name, public)
values ('shop-images', 'shop-images', true)
on conflict (id) do nothing;

create policy "shop_images_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'shop-images' and public.is_coach());

create policy "shop_images_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'shop-images' and public.is_coach())
  with check (bucket_id = 'shop-images' and public.is_coach());

create policy "shop_images_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'shop-images' and public.is_coach());
