-- One-time Supabase setup. Run in the Supabase SQL editor (or psql) AFTER
-- `prisma migrate deploy` has created the tables. Safe to re-run.
--
-- All application reads/writes go through the NestJS API using the direct
-- connection, so RLS here is a defense-in-depth measure that blocks the anon
-- key from touching the tables directly.

-- 1. Enable RLS on all app tables (the API's direct connection bypasses RLS).
alter table public.tenants enable row level security;
alter table public.works enable row level security;
alter table public.applications enable row level security;
alter table public.profiles enable row level security;

-- 2. Public read access for published content (lets the anon key read the
--    gallery/works if we ever want to query Supabase directly from clients).
drop policy if exists "public read active tenants" on public.tenants;
create policy "public read active tenants"
  on public.tenants for select
  using (status = 'active');

drop policy if exists "public read published works" on public.works;
create policy "public read published works"
  on public.works for select
  using (published = true);

-- 3. Writers can read their own profile.
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read"
  on public.profiles for select
  using (auth.uid() = id);

-- 4. Auto-create a profile row when a Supabase auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'writer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Backfill profiles for auth users created BEFORE the trigger existed.
insert into public.profiles (id, role)
select id, 'writer' from auth.users
on conflict (id) do nothing;

-- 6. Storage bucket for covers/avatars/media (public read).
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- NOTE: upload policies on storage.objects can no longer be created from the
-- SQL editor (it isn't the table owner). Create them in the dashboard instead:
--   Storage -> media bucket -> Policies -> New policy
--   1. "authenticated upload media": operation INSERT, target role `authenticated`,
--      WITH CHECK expression:  bucket_id = 'media'
--   2. (optional) UPDATE/DELETE policies, same role, USING expression:
--      bucket_id = 'media' and owner = auth.uid()
-- Public reads need no policy because the bucket is public.
