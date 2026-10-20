-- Watch Ghar: base schema. Run this FIRST on a NEW, EMPTY Supabase project,
-- then 20261006120000_orders.sql. (Do not run on any other store's project.)
--
-- Contents: categories, products, admin allowlist with roles (owner / purchaser),
-- public-read + staff-write RLS, and the product-images storage bucket.
-- Demo data is NOT included here: see supabase/seed_demo.sql (optional).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  icon text not null default 'Watch',
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  brand text not null default '',
  category text not null references public.categories (slug) on update cascade on delete restrict,
  description text not null default '',
  -- Spec bullets shown on the product page, e.g. "Case: 40 mm stainless steel".
  key_info text[] not null default '{}',
  price numeric(10, 2) not null check (price >= 0),
  sale_price numeric(10, 2) check (sale_price is null or (sale_price >= 0 and sale_price < price)),
  image text not null default '/images/products/placeholder.svg',
  stock integer not null default 0 check (stock >= 0),
  sku text not null default '',
  featured boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured) where featured;

-- Staff allowlist. Rows are created by the admin portal (service role) or by hand
-- (see the end of this file). Roles: owner = everything, purchaser = products and orders.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'purchaser' check (role in ('owner', 'purchaser')),
  email text,
  display_name text,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Role helpers (SECURITY DEFINER so RLS policies can call them safely)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'owner');
$$;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_owner() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_owner() to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.admin_users enable row level security;

-- Anyone can browse the catalog.
create policy "Public can read categories" on public.categories for select to anon, authenticated using (true);
create policy "Public can read products" on public.products for select to anon, authenticated using (true);

-- Staff (owner or purchaser) manage products; only owners manage categories.
create policy "Admins can insert products" on public.products for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update products" on public.products for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete products" on public.products for delete to authenticated using ((select public.is_admin()));

create policy "Owners can insert categories" on public.categories for insert to authenticated with check ((select public.is_owner()));
create policy "Owners can update categories" on public.categories for update to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "Owners can delete categories" on public.categories for delete to authenticated using ((select public.is_owner()));

-- A member can read their own row; owners can read the whole team. All writes to
-- admin_users go through the server-side service role key, never from the browser.
create policy "Members read own row, owners read team" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_owner()));

-- ---------------------------------------------------------------------------
-- Storage: public bucket for product photos, staff-only writes, 5 MB images.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

create policy "Admins can upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "Admins can update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "Admins can delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- FIRST OWNER (run once, by hand, after creating your login):
--   1. Supabase dashboard: Authentication -> Users -> Add user (email + password).
--   2. Then run:
--      insert into public.admin_users (user_id, role, email, display_name)
--      select id, 'owner', email, 'Owner' from auth.users where email = '<your email>';
-- ---------------------------------------------------------------------------
