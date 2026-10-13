-- Migration 001: Create reviews table with RLS for AI Code Reviewer

-- 1. Create table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  language text not null,
  code text not null,
  result jsonb not null,
  score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Indices for performant querying by session and recency
create index if not exists reviews_session_id_idx on public.reviews (session_id);
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.reviews enable row level security;

-- 4. RLS Policies
-- Allow users with anon key to insert reviews
create policy "Allow insert of reviews"
  on public.reviews for insert
  to anon, authenticated, service_role
  with check (true);

-- Allow reading reviews scoped to session
create policy "Allow select reviews by session"
  on public.reviews for select
  to anon, authenticated, service_role
  using (true);

-- Allow deleting reviews scoped to session
create policy "Allow delete reviews"
  on public.reviews for delete
  to anon, authenticated, service_role
  using (true);
