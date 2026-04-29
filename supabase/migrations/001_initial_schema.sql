-- Enable pg_cron for scheduled birthday/holiday email jobs
create extension if not exists pg_cron;

-- public.users extends Supabase auth.users with app-specific fields.
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text check (role in ('grandma', 'family')) not null,
  stripe_customer_id text,
  subscription_status text default 'inactive',
  created_at timestamptz default now()
);

-- Extended grandma info. One row per grandma user.
create table public.grandma_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  grandma_name text not null,
  birthday date,
  photo_url text,
  created_at timestamptz default now()
);

-- Links family members to a grandma account via invite token.
create table public.family_links (
  id uuid default gen_random_uuid() primary key,
  grandma_id uuid references public.grandma_profiles(id) on delete cascade not null,
  family_user_id uuid references public.users(id) on delete cascade,
  invite_token text unique not null,
  status text check (status in ('pending', 'accepted')) default 'pending',
  created_at timestamptz default now()
);

-- Manually curated product catalog. Managed by admin only.
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10,2),
  image_url text,
  product_url text not null,
  retailer text,
  category text,
  is_customizable boolean default false,
  created_at timestamptz default now()
);

-- Grandma's saved wish list items.
create table public.registry_items (
  id uuid default gen_random_uuid() primary key,
  grandma_id uuid references public.grandma_profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  added_at timestamptz default now(),
  is_purchased boolean default false,
  purchased_by uuid references public.users(id)
);

-- Stripe subscription tracking. Written by webhook handler only.
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  stripe_subscription_id text unique not null,
  plan text check (plan in ('monthly', 'yearly')) not null,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- Trigger: auto-insert into public.users on new auth.users row
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- RLS: enable on all tables
-- ============================================================
alter table public.users enable row level security;
alter table public.grandma_profiles enable row level security;
alter table public.family_links enable row level security;
alter table public.products enable row level security;
alter table public.registry_items enable row level security;
alter table public.subscriptions enable row level security;

-- users: own row only
create policy "users: read own" on public.users for select using (auth.uid() = id);
create policy "users: update own" on public.users for update using (auth.uid() = id);

-- grandma_profiles: grandma can CRUD own; linked family can read
create policy "grandma_profiles: grandma crud" on public.grandma_profiles
  for all using (auth.uid() = user_id);

create policy "grandma_profiles: family read" on public.grandma_profiles
  for select using (
    exists (
      select 1 from public.family_links
      where grandma_id = grandma_profiles.id
        and family_user_id = auth.uid()
        and status = 'accepted'
    )
  );

-- family_links: grandma can read/create for her profile; family can read own link
create policy "family_links: grandma manage" on public.family_links
  for all using (
    exists (
      select 1 from public.grandma_profiles
      where id = family_links.grandma_id
        and user_id = auth.uid()
    )
  );

create policy "family_links: family read own" on public.family_links
  for select using (family_user_id = auth.uid());

-- products: public read; writes via service role only
create policy "products: public read" on public.products
  for select using (true);

-- registry_items: grandma CRUD own; linked family read + update is_purchased
create policy "registry_items: grandma crud" on public.registry_items
  for all using (
    exists (
      select 1 from public.grandma_profiles
      where id = registry_items.grandma_id
        and user_id = auth.uid()
    )
  );

create policy "registry_items: family read" on public.registry_items
  for select using (
    exists (
      select 1 from public.family_links
      where grandma_id = registry_items.grandma_id
        and family_user_id = auth.uid()
        and status = 'accepted'
    )
  );

create policy "registry_items: family mark purchased" on public.registry_items
  for update using (
    exists (
      select 1 from public.family_links
      where grandma_id = registry_items.grandma_id
        and family_user_id = auth.uid()
        and status = 'accepted'
    )
  ) with check (true);

-- subscriptions: read own; all writes via service role only
create policy "subscriptions: read own" on public.subscriptions
  for select using (auth.uid() = user_id);
