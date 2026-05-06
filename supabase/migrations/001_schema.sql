-- ============================================================
-- My Grandma Name — V2 Initial Schema
-- Run this first, then run 002_rls.sql.
--
-- pg_cron must be enabled separately via the Supabase dashboard:
-- Database → Extensions → pg_cron
-- ============================================================

-- moddatetime powers the updated_at triggers below.
create extension if not exists moddatetime;

-- ============================================================
-- Tables
-- ============================================================

-- App users: extends Supabase auth.users.
-- Inserted automatically via the on_auth_user_created trigger below.
create table public.users (
  id                       uuid references auth.users(id) on delete cascade primary key,
  email                    text not null unique,
  role                     text check (role in ('free', 'grandma', 'family')) not null default 'free',
  subscription_status      text default 'inactive',
  stripe_customer_id       text,
  generator_uses_remaining integer default 2,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- Full paid grandma profile. All fields required at onboarding.
create table public.grandma_profiles (
  id                   uuid default gen_random_uuid() primary key,
  user_id              uuid references public.users(id) on delete cascade not null unique,
  first_name           text not null,
  last_name            text not null,
  email                text not null,
  grandma_name         text not null,
  birthday             date not null,
  phone_number         text not null,
  text_updates_opt_in  boolean not null default false,
  bio                  text not null,
  photo_url            text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Lightweight profile for free users before they upgrade.
-- pending_grandma_name prefills grandma_name during paid onboarding.
create table public.free_profiles (
  id                   uuid default gen_random_uuid() primary key,
  user_id              uuid references public.users(id) on delete cascade not null unique,
  email                text not null,
  first_name           text,
  last_name            text,
  bio                  text,
  pending_grandma_name text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Invite-only family members, each linked to exactly one grandma account.
-- user_id is null until the invite is accepted and the account is created.
create table public.family_members (
  id             uuid default gen_random_uuid() primary key,
  grandma_id     uuid references public.grandma_profiles(id) on delete cascade not null,
  user_id        uuid references public.users(id) on delete cascade unique,
  first_name     text,
  last_name      text,
  email          text not null,
  relationship   text,
  invite_token   text unique not null,
  invite_status  text check (invite_status in ('pending', 'accepted', 'expired')) default 'pending',
  created_at     timestamptz default now(),
  accepted_at    timestamptz
);

-- Curated marketplace products. Admin-managed only via Supabase dashboard.
-- Use affiliate_url when present; fall back to product_url.
-- display_order controls editorial sort; set directly in Supabase dashboard.
create table public.products (
  id                uuid default gen_random_uuid() primary key,
  name              text not null,
  image_url         text not null,
  product_url       text not null,
  affiliate_url     text,
  category          text check (category in ('personal', 'home', 'entertaining')) not null,
  price             numeric(10,2),
  brand             text,
  short_description text,
  display_order     integer default 0,
  is_active         boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Optional lists/tags created by paid grandma users to organize their registry.
create table public.registry_lists (
  id         uuid default gen_random_uuid() primary key,
  grandma_id uuid references public.grandma_profiles(id) on delete cascade not null,
  name       text not null,
  created_at timestamptz default now()
);

-- Grandma's saved registry items. Family is read-only. No purchase marking in V1.
create table public.registry_items (
  id         uuid default gen_random_uuid() primary key,
  grandma_id uuid references public.grandma_profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  list_id    uuid references public.registry_lists(id) on delete set null,
  note       text,
  added_at   timestamptz default now(),
  unique (grandma_id, product_id)
);

-- Stripe subscription tracking. Written by webhook handler only; never by client.
create table public.subscriptions (
  id                     uuid default gen_random_uuid() primary key,
  user_id                uuid references public.users(id) on delete cascade not null,
  stripe_subscription_id text unique not null,
  plan                   text check (plan in ('monthly', 'annual')) not null,
  status                 text not null,
  trial_end              timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- Saved name generator results. Paid grandma users only; anonymous results are never stored.
create table public.saved_name_results (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.users(id) on delete cascade not null,
  winner_name   text not null,
  runner_up_name text not null,
  explanation   text not null,
  created_at    timestamptz default now()
);

-- ============================================================
-- Auth trigger: auto-insert into public.users on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'free')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- updated_at triggers (moddatetime)
-- ============================================================
create trigger handle_updated_at_users
  before update on public.users
  for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_grandma_profiles
  before update on public.grandma_profiles
  for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_free_profiles
  before update on public.free_profiles
  for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_products
  before update on public.products
  for each row execute procedure moddatetime(updated_at);

create trigger handle_updated_at_subscriptions
  before update on public.subscriptions
  for each row execute procedure moddatetime(updated_at);
