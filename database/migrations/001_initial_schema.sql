-- ============================================================================
-- Ratevo Initial Schema Migration
-- Version: 001
-- Project: Ratevo by Xoiex
-- Database: Supabase PostgreSQL
-- Migration file: database/migrations/001_initial_schema.sql
-- 
-- This migration creates all required tables, indexes, triggers, RLS policies,
-- and the public business view. It is rerunnable (IF NOT EXISTS) and safe
-- for fresh databases. All tables confirmed absent via to_regclass().
-- ============================================================================

-- Enable pgcrypto for gen_random_uuid() (built-in)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- PROFILES TABLE
-- Extends Supabase auth.users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Grant minimum privileges for authenticated owners (RLS filters rows)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
-- anon has no access to profiles

-- ============================================================================
-- BUSINESSES TABLE
-- Core business entity owned by authenticated users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  google_review_url TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Owner policies (auth.uid() = owner_id)
DROP POLICY IF EXISTS "Owners can view own businesses" ON public.businesses;
CREATE POLICY "Owners can view own businesses"
  ON public.businesses FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can insert own businesses" ON public.businesses;
CREATE POLICY "Owners can insert own businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own businesses" ON public.businesses;
CREATE POLICY "Owners can update own businesses"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete own businesses" ON public.businesses;
CREATE POLICY "Owners can delete own businesses"
  ON public.businesses FOR DELETE
  USING (auth.uid() = owner_id);

-- NO public SELECT policy on base table.
-- Public access via business_public view only.

-- Grant minimum privileges for authenticated owners (RLS filters rows)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
-- anon has no access to businesses

-- ============================================================================
-- PUBLIC BUSINESS VIEW (Security Barrier)
-- Exposes only the six columns required by the customer review page:
-- id, name, category, address, google_review_url, slug
-- Backend uses service-role client to query businesses directly with explicit column selection.
-- This view is for direct PostgREST access if needed.
-- ============================================================================
CREATE OR REPLACE VIEW public.business_public
WITH (security_barrier = true) AS
SELECT
  id,
  name,
  category,
  address,
  google_review_url,
  slug
FROM public.businesses;

-- Grant public/anon access to the view only
REVOKE ALL ON public.business_public FROM anon, authenticated;
GRANT SELECT ON public.business_public TO anon;
GRANT SELECT ON public.business_public TO authenticated;

-- ============================================================================
-- REVIEW SESSIONS TABLE
-- Stores review session state; written by backend service-role.
-- Backend uses `id` column as the session identifier (generated via uuidv4()).
-- No separate `session_id` column needed.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_data JSONB DEFAULT '[]',
  customer_text TEXT,
  generated_review TEXT,
  generation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_sessions_business_id ON public.review_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_review_sessions_id ON public.review_sessions(id);

ALTER TABLE public.review_sessions ENABLE ROW LEVEL SECURITY;

-- Owner read policy
DROP POLICY IF EXISTS "Owners can view sessions for own businesses" ON public.review_sessions;
CREATE POLICY "Owners can view sessions for own businesses"
  ON public.review_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE public.businesses.id = public.review_sessions.business_id
      AND public.businesses.owner_id = auth.uid()
    )
  );

-- NO public INSERT/UPDATE policies.
-- Customer review flow uses backend API with service-role client (bypasses RLS).
-- Direct PostgREST access from anon is intentionally blocked.

-- Grant minimum privileges for authenticated owners (RLS filters rows)
GRANT SELECT ON public.review_sessions TO authenticated;
-- anon has no access to review_sessions

-- ============================================================================
-- REVIEW EVENTS TABLE
-- Analytics events; written by backend service-role.
-- Foreign key references review_sessions.id (the session identifier used by backend).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.review_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.review_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'qr_scan',
    'rating_submitted',
    'feedback_submitted',
    'review_generated',
    'google_review_clicked'
  )),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_events_business_id ON public.review_events(business_id);
CREATE INDEX IF NOT EXISTS idx_review_events_session_id ON public.review_events(session_id);
CREATE INDEX IF NOT EXISTS idx_review_events_created_at ON public.review_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_events_event_type ON public.review_events(event_type);

ALTER TABLE public.review_events ENABLE ROW LEVEL SECURITY;

-- Owner read policy
DROP POLICY IF EXISTS "Owners can view events for own businesses" ON public.review_events;
CREATE POLICY "Owners can view events for own businesses"
  ON public.review_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE public.businesses.id = public.review_events.business_id
      AND public.businesses.owner_id = auth.uid()
    )
  );

-- NO public INSERT policy.
-- Event tracking uses backend API with service-role client (bypasses RLS).

-- Grant minimum privileges for authenticated owners (RLS filters rows)
GRANT SELECT ON public.review_events TO authenticated;
-- anon has no access to review_events

-- ============================================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- Run these in Supabase SQL Editor after applying the migration
-- ============================================================================

-- 1. Verify all tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('profiles', 'businesses', 'review_sessions', 'review_events');

-- 2. Verify businesses columns and constraints
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'businesses'
-- ORDER BY ordinal_position;

-- 3. Verify review_sessions columns (no session_id column)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'review_sessions'
-- ORDER BY ordinal_position;

-- 4. Verify review_events FK points to review_sessions.id
-- SELECT
--   tc.constraint_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
--   AND tc.table_schema = kcu.table_schema
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
--   AND ccu.table_schema = tc.table_schema
-- WHERE tc.constraint_type = 'FOREIGN KEY'
-- AND tc.table_name = 'review_events';

-- 5. Verify RLS policies on businesses
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'businesses';

-- 6. Verify table privileges for authenticated (anon should have none on base tables)
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public'
-- AND table_name IN ('profiles', 'businesses', 'review_sessions', 'review_events')
-- AND grantee IN ('anon', 'authenticated')
-- ORDER BY table_name, grantee;

-- 7. Verify business_public view
-- SELECT * FROM public.business_public LIMIT 1;
-- \d+ public.business_public

-- 8. Verify view grants
-- SELECT grantee, privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public' AND table_name = 'business_public';

-- 9. Verify trigger
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.businesses'::regclass;