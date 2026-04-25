-- ============================================================
-- Aegis – Community Builds
-- Run this SQL in the Supabase SQL Editor to set up the
-- community builds table with Row Level Security.
-- ============================================================

-- 1. Create the table
create table if not exists public.community_builds (
  id              uuid primary key default gen_random_uuid(),
  game_id         text not null,
  name            text not null,
  author          text,
  civilization    text,
  difficulty      text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  data            jsonb not null,
  status          text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected')),
  submitted_at    timestamptz not null default now(),
  moderated_at    timestamptz,
  moderator_notes text,
  submitter_email text
);

-- Index for fast filtering by status
create index if not exists community_builds_status_idx
  on public.community_builds (status, submitted_at desc);

-- 2. Enable Row Level Security
alter table public.community_builds enable row level security;

-- 3. Table-level privileges ─────────────────────────────────
-- Supabase SQL migrations do not automatically grant privileges to
-- the anon / authenticated roles (unlike the Table Editor UI).
-- Without these GRANTs, RLS policies are never reached and every
-- INSERT from an unauthenticated client fails with
-- "new row violates row-level security policy".

grant select, insert on public.community_builds to anon;
grant select, insert, update, delete on public.community_builds to authenticated;

-- 4. RLS Policies ────────────────────────────────────────────

-- Anyone can read approved builds (public catalogue)
create policy "Public read approved"
  on public.community_builds
  for select
  using (status = 'approved');

-- Anyone (anon) can insert a new pending submission
create policy "Anyone can submit"
  on public.community_builds
  for insert
  with check (status = 'pending');

-- Authenticated admins can read all rows (including pending/rejected)
create policy "Admin read all"
  on public.community_builds
  for select
  to authenticated
  using (true);

-- Authenticated admins can update (approve/reject) any row
create policy "Admin moderate"
  on public.community_builds
  for update
  to authenticated
  using (true)
  with check (true);

-- Authenticated admins can delete rows
create policy "Admin delete"
  on public.community_builds
  for delete
  to authenticated
  using (true);

-- ============================================================
-- NOTES
-- ============================================================
-- • The "anon" role is used for public reads and inserts.
--   Only rows with status='approved' are readable without auth.
-- • The "authenticated" role is used for the admin interface.
--   After signing in via magic link, the admin's JWT has role=authenticated
--   which grants full access via the policies above.
-- • To restrict admin access to specific email addresses, you can add
--   an additional check in the admin policies, e.g.:
--     using (auth.email() = 'admin@yourdomain.com')
-- • Enable Realtime for this table in:
--   Supabase → Database → Replication → community_builds (INSERT)
-- ============================================================
