-- ============================================================================
-- Realm — Row Level Security
-- These policies are the real enforcement layer for the audit checklist:
--   * creators manage only their own products
--   * buyers (and visitors) see only published products
--   * only the two parties can read/write a conversation's messages
--   * orders are visible to their buyer and creator only
--   * ratings can be created only by the buyer of a closed order
-- ============================================================================

alter table profiles        enable row level security;
alter table categories      enable row level security;
alter table products        enable row level security;
alter table product_images  enable row level security;
alter table portfolio_items enable row level security;
alter table conversations   enable row level security;
alter table messages        enable row level security;
alter table orders          enable row level security;
alter table ratings         enable row level security;

-- Profiles -------------------------------------------------------------------
create policy "profiles are public" on profiles
  for select using (true);
create policy "users update own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "admin updates any profile" on profiles
  for update using (is_admin());

-- Categories -----------------------------------------------------------------
create policy "categories are public" on categories
  for select using (true);
create policy "admin manages categories" on categories
  for all using (is_admin()) with check (is_admin());

-- Products -------------------------------------------------------------------
-- Visitors/buyers: only published. Creators: their own (any status). Admin: all.
create policy "published products are public" on products
  for select using (
    status = 'published'
    or creator_id = auth.uid()
    or is_admin()
  );
create policy "creators insert own products" on products
  for insert with check (
    creator_id = auth.uid()
    and exists (select 1 from profiles where id = auth.uid() and role in ('creator','admin'))
  );
create policy "creators update own products" on products
  for update using (creator_id = auth.uid() or is_admin())
  with check (creator_id = auth.uid() or is_admin());
create policy "creators delete own products" on products
  for delete using (creator_id = auth.uid() or is_admin());

-- Product images mirror their product's visibility ---------------------------
create policy "product images readable with product" on product_images
  for select using (
    exists (select 1 from products p where p.id = product_id
      and (p.status = 'published' or p.creator_id = auth.uid() or is_admin()))
  );
create policy "creators manage own product images" on product_images
  for all using (
    exists (select 1 from products p where p.id = product_id and (p.creator_id = auth.uid() or is_admin()))
  ) with check (
    exists (select 1 from products p where p.id = product_id and (p.creator_id = auth.uid() or is_admin()))
  );

-- Portfolio ------------------------------------------------------------------
create policy "portfolio is public" on portfolio_items
  for select using (true);
create policy "creators manage own portfolio" on portfolio_items
  for all using (creator_id = auth.uid() or is_admin())
  with check (creator_id = auth.uid() or is_admin());

-- Conversations --------------------------------------------------------------
create policy "parties read their conversations" on conversations
  for select using (buyer_id = auth.uid() or creator_id = auth.uid() or is_admin());
create policy "buyer opens conversation" on conversations
  for insert with check (buyer_id = auth.uid());
create policy "parties update their conversation" on conversations
  for update using (buyer_id = auth.uid() or creator_id = auth.uid());

-- Messages -------------------------------------------------------------------
create policy "parties read messages" on messages
  for select using (
    exists (select 1 from conversations c where c.id = conversation_id
      and (c.buyer_id = auth.uid() or c.creator_id = auth.uid() or is_admin()))
  );
create policy "parties send messages" on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from conversations c where c.id = conversation_id
      and (c.buyer_id = auth.uid() or c.creator_id = auth.uid()))
  );
create policy "recipient marks read" on messages
  for update using (
    exists (select 1 from conversations c where c.id = conversation_id
      and (c.buyer_id = auth.uid() or c.creator_id = auth.uid()))
  );

-- Orders ---------------------------------------------------------------------
create policy "parties read their orders" on orders
  for select using (buyer_id = auth.uid() or creator_id = auth.uid() or is_admin());
create policy "buyer creates order" on orders
  for insert with check (buyer_id = auth.uid());
-- creator transitions accept/closed/cancelled; buyer may cancel own 'requested'
create policy "creator updates order" on orders
  for update using (creator_id = auth.uid())
  with check (creator_id = auth.uid());
create policy "buyer cancels requested order" on orders
  for update using (buyer_id = auth.uid() and status = 'requested')
  with check (buyer_id = auth.uid() and status = 'cancelled');

-- Ratings --------------------------------------------------------------------
-- Read public (they appear on profiles). Insert gated by trigger + this check.
create policy "ratings are public" on ratings
  for select using (true);
create policy "buyer rates closed order" on ratings
  for insert with check (
    buyer_id = auth.uid()
    and exists (select 1 from orders o where o.id = order_id
      and o.buyer_id = auth.uid() and o.status = 'closed')
  );
