-- ============================================================
-- Aegis – Fix anonymous INSERT grants for community_builds
--
-- Migration 001 created RLS policies but omitted the table-level
-- GRANT statements that Supabase requires when tables are created
-- via SQL (the Table Editor UI adds these automatically, but the
-- SQL editor does not).
--
-- Without these grants the anon role never reaches the RLS check
-- and every unauthenticated INSERT fails with:
--   "new row violates row-level security policy for table community_builds"
--
-- Run this in the Supabase SQL Editor if you already applied 001.
-- ============================================================

-- Allow anonymous (unauthenticated) users to read approved builds
-- and submit new pending builds.
grant select, insert on public.community_builds to anon;

-- Allow authenticated admins full access (select / moderate / delete).
grant select, insert, update, delete on public.community_builds to authenticated;
