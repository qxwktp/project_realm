-- ============================================================================
-- Realm — Category & Listing Structure (IP compliance)
--
-- Implements the two-system model from the Category Structure Handoff:
--   System A  content_type   → what buyers browse (generic media, NO brands)
--   System B  listing_category → legal classification (badge + listing fields)
-- These are intentionally TWO separate fields. Do not merge them.
--
-- Also adds the report/takedown plumbing the handoff requires.
-- Enum values and disclaimer text are kept out of hardcoded UI where practical
-- so they can be adjusted after a real IP-lawyer review.
-- ============================================================================

-- System A: content-type navigation (generic descriptions of a medium) -------
create type content_type as enum (
  'tabletop_games',   -- Tabletop Games
  'movies',           -- Movies
  'games',            -- Games (video game characters)
  'anime',            -- Anime
  'original_designs'  -- Original Designs
);

-- System B: legal listing classification (drives compliance UI) --------------
create type listing_category as enum (
  'original',          -- Original Design
  'licensed_painting', -- Licensed Miniature Painting
  'fan_inspired'       -- Fan-Inspired Design
);

-- Extend products with both systems + compliance fields ----------------------
alter table products
  add column content_type content_type not null default 'original_designs',
  add column listing_category listing_category not null default 'original',
  -- Licensed Miniature Painting: name of the official product line being painted
  add column base_kit_source text default '',
  -- Licensed: creator confirms the kit is an officially purchasable product
  add column license_confirmed boolean not null default false,
  -- Fan-Inspired: creator attests they understand the rights position
  add column rights_attestation boolean not null default false,
  -- free-text creator tags (min 1 required at the app layer); NOT suggested
  -- from other creators' tags per the handoff
  add column tags text[] not null default '{}',
  -- moderation: count of upheld IP flags against the listing's creator
  add column ip_flags_count int not null default 0;

-- Reports / takedown queue (separate from any general contact form) ----------
create table listing_reports (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  reporter_id  uuid references profiles(id) on delete set null,
  reason       text not null,
  details      text default '',
  status       text not null default 'open',  -- open | reviewed | removed | dismissed
  created_at   timestamptz not null default now()
);
create index listing_reports_product_idx on listing_reports(product_id);
create index listing_reports_status_idx on listing_reports(status);

alter table listing_reports enable row level security;

-- anyone signed in may file a report
create policy "signed-in users file reports" on listing_reports
  for insert with check (auth.uid() is not null);
-- reporter can see their own reports; admins see all
create policy "reporter or admin reads reports" on listing_reports
  for select using (reporter_id = auth.uid() or is_admin());
-- only admins update/triage reports
create policy "admin updates reports" on listing_reports
  for update using (is_admin());

-- Admin helper: remove a listing, notify (app layer), bump creator ip flag ---
-- Increments ip_flags_count on all the creator's products for a simple running
-- count, and hides the offending listing. Called from an admin server action.
create or replace function admin_flag_listing(p_product_id uuid) returns void as $$
declare c uuid;
begin
  if not is_admin() then raise exception 'admin only'; end if;
  select creator_id into c from products where id = p_product_id;
  update products set status = 'hidden' where id = p_product_id;
  update products set ip_flags_count = ip_flags_count + 1 where creator_id = c;
end;
$$ language plpgsql security definer;

-- Reseed browse categories to the System A content types --------------------
-- (Old fantasy categories are replaced by content-type navigation. Existing
--  products keep working via the new content_type column's default.)
delete from categories;
insert into categories (name, slug, sort) values
  ('Tabletop Games','tabletop-games',1),
  ('Movies','movies',2),
  ('Games','games',3),
  ('Anime','anime',4),
  ('Original Designs','original-designs',5);
