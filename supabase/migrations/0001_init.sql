-- ============================================================================
-- Realm — initial schema
-- Marketplace connecting miniature creators with buyers.
-- Discovery + in-platform messaging + orders (analytics) + ratings.
-- No online payments (per Technical Specification v1.2).
-- ============================================================================

-- Enums ----------------------------------------------------------------------
create type user_role as enum ('buyer', 'creator', 'admin');
create type product_status as enum ('draft', 'published', 'hidden');
create type order_status as enum ('requested', 'accepted', 'closed', 'cancelled');

-- Profiles -------------------------------------------------------------------
-- One row per auth user. Mirrors auth.users; created by a trigger on signup.
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  username     text unique not null,
  display_name text not null,
  role         user_role not null default 'buyer',
  bio          text default '',
  avatar_url   text,
  socials      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index profiles_role_idx on profiles(role);
create index profiles_username_idx on profiles(username);

-- Categories -----------------------------------------------------------------
create table categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  slug  text unique not null,
  sort  int not null default 0
);

-- Products -------------------------------------------------------------------
create table products (
  id           uuid primary key default gen_random_uuid(),
  creator_id   uuid not null references profiles(id) on delete cascade,
  category_id  uuid references categories(id) on delete set null,
  title        text not null,
  description  text default '',
  price        numeric(10,2) not null default 0,   -- "information price" guide
  status       product_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index products_creator_idx on products(creator_id);
create index products_status_idx on products(status);
create index products_category_idx on products(category_id);

-- Product images (Storage paths in the 'products' bucket) --------------------
create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  path        text not null,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);
create index product_images_product_idx on product_images(product_id);

-- Portfolio items (Storage paths in the 'portfolio' bucket) ------------------
create table portfolio_items (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references profiles(id) on delete cascade,
  title       text default '',
  path        text not null,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);
create index portfolio_creator_idx on portfolio_items(creator_id);

-- Conversations & messages ---------------------------------------------------
create table conversations (
  id          uuid primary key default gen_random_uuid(),
  buyer_id    uuid not null references profiles(id) on delete cascade,
  creator_id  uuid not null references profiles(id) on delete cascade,
  product_id  uuid references products(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (buyer_id, creator_id)
);
create index conversations_buyer_idx on conversations(buyer_id);
create index conversations_creator_idx on conversations(creator_id);

create table messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  sender_id        uuid not null references profiles(id) on delete cascade,
  content          text not null,
  is_read          boolean not null default false,
  created_at       timestamptz not null default now()
);
create index messages_conversation_idx on messages(conversation_id);

-- Orders (no payment — used for tracking + analytics) ------------------------
create table orders (
  id          uuid primary key default gen_random_uuid(),
  buyer_id    uuid not null references profiles(id) on delete cascade,
  creator_id  uuid not null references profiles(id) on delete cascade,
  product_id  uuid references products(id) on delete set null,
  status      order_status not null default 'requested',
  note        text default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index orders_buyer_idx on orders(buyer_id);
create index orders_creator_idx on orders(creator_id);

-- Ratings (one per order, only after the order is closed) --------------------
create table ratings (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null unique references orders(id) on delete cascade,
  creator_id  uuid not null references profiles(id) on delete cascade,
  buyer_id    uuid not null references profiles(id) on delete cascade,
  score       int not null check (score between 1 and 5),
  text        text default '',
  created_at  timestamptz not null default now()
);
create index ratings_creator_idx on ratings(creator_id);

-- Convenience view: creator aggregate rating --------------------------------
create view creator_stats as
select
  p.id as creator_id,
  coalesce(avg(r.score), 0)::numeric(3,2) as avg_rating,
  count(r.id) as rating_count,
  (select count(*) from orders o where o.creator_id = p.id and o.status = 'closed') as completed_orders
from profiles p
left join ratings r on r.creator_id = p.id
where p.role = 'creator'
group by p.id;

-- Triggers -------------------------------------------------------------------
-- keep updated_at fresh
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger products_touch before update on products
  for each row execute function touch_updated_at();
create trigger profiles_touch before update on profiles
  for each row execute function touch_updated_at();
create trigger orders_touch before update on orders
  for each row execute function touch_updated_at();

-- bump conversation.updated_at when a message arrives
create or replace function bump_conversation() returns trigger as $$
begin
  update conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;
create trigger messages_bump after insert on messages
  for each row execute function bump_conversation();

-- create a profile row automatically on signup, using signup metadata
create or replace function handle_new_user() returns trigger as $$
declare
  uname text;
begin
  uname := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  -- ensure uniqueness with a short suffix if needed
  if exists (select 1 from profiles where username = uname) then
    uname := uname || '_' || substr(new.id::text, 1, 4);
  end if;
  insert into profiles (id, email, username, display_name, role)
  values (
    new.id,
    new.email,
    uname,
    coalesce(new.raw_user_meta_data->>'display_name', uname),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'buyer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- guard: a rating may only be inserted for a closed order owned by the buyer
create or replace function enforce_rating_rules() returns trigger as $$
declare o orders%rowtype;
begin
  select * into o from orders where id = new.order_id;
  if o.id is null then raise exception 'order not found'; end if;
  if o.status <> 'closed' then raise exception 'can only rate a closed order'; end if;
  if o.buyer_id <> new.buyer_id then raise exception 'only the buyer may rate'; end if;
  if o.creator_id <> new.creator_id then raise exception 'creator mismatch'; end if;
  return new;
end;
$$ language plpgsql;
create trigger ratings_guard before insert on ratings
  for each row execute function enforce_rating_rules();

-- Seed categories ------------------------------------------------------------
insert into categories (name, slug, sort) values
  ('Heroes','heroes',1),('Monsters','monsters',2),('NPCs','npcs',3),
  ('Terrain','terrain',4),('Busts','busts',5),('Collectibles','collectibles',6);
