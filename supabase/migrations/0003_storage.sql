-- ============================================================================
-- Realm — Storage buckets + access policies
-- Buckets: avatars, portfolio, products  (public read; owner-scoped writes)
-- Files are written under a path prefixed with the owner's user id, e.g.
--   products/<auth.uid>/<product_id>/<file>.jpg
-- so we can check ownership from the first path segment.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('avatars','avatars', true),
       ('portfolio','portfolio', true),
       ('products','products', true)
on conflict (id) do nothing;

-- public read on all three buckets
create policy "public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "public read portfolio" on storage.objects
  for select using (bucket_id = 'portfolio');
create policy "public read products" on storage.objects
  for select using (bucket_id = 'products');

-- owners write to their own prefixed folder (auth.uid() = first path segment)
create policy "owner writes avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner updates avatars" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner deletes avatars" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner writes portfolio" on storage.objects
  for insert with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner updates portfolio" on storage.objects
  for update using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner deletes portfolio" on storage.objects
  for delete using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner writes products" on storage.objects
  for insert with check (bucket_id = 'products' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner updates products" on storage.objects
  for update using (bucket_id = 'products' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner deletes products" on storage.objects
  for delete using (bucket_id = 'products' and (storage.foldername(name))[1] = auth.uid()::text);
