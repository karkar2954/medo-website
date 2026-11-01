-- شغّل هذا مرة واحدة في Supabase > SQL Editor
create table if not exists public.study_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  data_key text not null,
  payload jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, data_key)
);
alter table public.study_data enable row level security;
drop policy if exists "Users can read own study data" on public.study_data;
create policy "Users can read own study data" on public.study_data for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own study data" on public.study_data;
create policy "Users can insert own study data" on public.study_data for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own study data" on public.study_data;
create policy "Users can update own study data" on public.study_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
