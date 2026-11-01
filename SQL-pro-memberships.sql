-- Medo Pro memberships: run once in Supabase SQL Editor.
-- Users can read only their own membership. The public website cannot activate or edit memberships.
create table if not exists public.pro_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'inactive' check (status in ('inactive','active','expired','cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint valid_membership_period check (ends_at is null or starts_at is null or ends_at > starts_at)
);

alter table public.pro_memberships enable row level security;
drop policy if exists "Users can read own Pro membership" on public.pro_memberships;
create policy "Users can read own Pro membership" on public.pro_memberships
  for select to authenticated using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies are intentionally created.
-- Manual activation (admin only): replace USER_UUID with the user's Auth UID after confirming payment.
-- This grants 30 days from now; run only from the trusted Supabase SQL Editor.
-- insert into public.pro_memberships (user_id, status, starts_at, ends_at, updated_at)
-- values ('USER_UUID', 'active', now(), now() + interval '30 days', now())
-- on conflict (user_id) do update set status='active', starts_at=now(), ends_at=now()+interval '30 days', updated_at=now();

-- Manual cancellation (admin only):
-- update public.pro_memberships set status='cancelled', updated_at=now() where user_id='USER_UUID';
