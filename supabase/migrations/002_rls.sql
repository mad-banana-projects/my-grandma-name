-- ============================================================
-- My Grandma Name — V2 RLS Policies
-- Run after 001_schema.sql.
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table public.users enable row level security;
alter table public.grandma_profiles enable row level security;
alter table public.free_profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.products enable row level security;
alter table public.registry_lists enable row level security;
alter table public.registry_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.saved_name_results enable row level security;

-- ============================================================
-- users
-- Users can read their own row only.
-- All writes (role, subscription_status, stripe_customer_id,
-- generator_uses_remaining) are service-role-only — no user-level
-- update policy is needed.
-- ============================================================
create policy "users: read own"
  on public.users for select
  using (auth.uid() = id);

-- ============================================================
-- grandma_profiles
-- Paid grandma can CRUD her own profile.
-- Linked and accepted family members can read only.
-- ============================================================
create policy "grandma_profiles: grandma crud"
  on public.grandma_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "grandma_profiles: family read"
  on public.grandma_profiles for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.grandma_id = grandma_profiles.id
        and fm.user_id = auth.uid()
        and fm.invite_status = 'accepted'
    )
  );

-- ============================================================
-- free_profiles
-- Free users can read, insert, and update their own profile only.
-- ============================================================
create policy "free_profiles: owner read"
  on public.free_profiles for select
  using (auth.uid() = user_id);

create policy "free_profiles: owner insert"
  on public.free_profiles for insert
  with check (auth.uid() = user_id);

create policy "free_profiles: owner update"
  on public.free_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- family_members
-- Grandma can create and read family_members rows linked to her profile.
-- Family can read their own accepted row.
-- ============================================================
create policy "family_members: grandma manage"
  on public.family_members for all
  using (
    exists (
      select 1 from public.grandma_profiles gp
      where gp.id = family_members.grandma_id
        and gp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.grandma_profiles gp
      where gp.id = family_members.grandma_id
        and gp.user_id = auth.uid()
    )
  );

create policy "family_members: family read own"
  on public.family_members for select
  using (
    family_members.user_id = auth.uid()
    and family_members.invite_status = 'accepted'
  );

-- ============================================================
-- products
-- All users (including anonymous) can read active products.
-- The 4–6 item preview limit for anonymous visitors is enforced
-- at the application layer, not in RLS.
-- All writes are service-role / admin only.
-- ============================================================
create policy "products: public read active"
  on public.products for select
  using (is_active = true);

-- ============================================================
-- registry_lists
-- Grandma can CRUD her own lists.
-- Linked and accepted family members can read list names only.
-- ============================================================
create policy "registry_lists: grandma crud"
  on public.registry_lists for all
  using (
    exists (
      select 1 from public.grandma_profiles gp
      where gp.id = registry_lists.grandma_id
        and gp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.grandma_profiles gp
      where gp.id = registry_lists.grandma_id
        and gp.user_id = auth.uid()
    )
  );

create policy "registry_lists: family read"
  on public.registry_lists for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.grandma_id = registry_lists.grandma_id
        and fm.user_id = auth.uid()
        and fm.invite_status = 'accepted'
    )
  );

-- ============================================================
-- registry_items
-- Grandma can CRUD her own saved items.
-- Linked and accepted family members can read only.
-- Family cannot update or delete registry items in V1.
-- ============================================================
create policy "registry_items: grandma crud"
  on public.registry_items for all
  using (
    exists (
      select 1 from public.grandma_profiles gp
      where gp.id = registry_items.grandma_id
        and gp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.grandma_profiles gp
      where gp.id = registry_items.grandma_id
        and gp.user_id = auth.uid()
    )
  );

create policy "registry_items: family read"
  on public.registry_items for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.grandma_id = registry_items.grandma_id
        and fm.user_id = auth.uid()
        and fm.invite_status = 'accepted'
    )
  );

-- ============================================================
-- subscriptions
-- Users can read their own subscription row.
-- All writes go through the Stripe webhook handler (service role).
-- ============================================================
create policy "subscriptions: read own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ============================================================
-- saved_name_results
-- Users can read their own saved results.
-- Only paid grandma users (role = 'grandma', subscription_status = 'active')
-- can insert. Anonymous and free users cannot write.
-- ============================================================
create policy "saved_name_results: read own"
  on public.saved_name_results for select
  using (auth.uid() = user_id);

create policy "saved_name_results: paid grandma insert"
  on public.saved_name_results for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role = 'grandma'
        and u.subscription_status = 'active'
    )
  );
