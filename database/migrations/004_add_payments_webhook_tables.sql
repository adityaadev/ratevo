-- ============================================================================
-- Ratevo Payments & Webhook Tables Migration
-- Version: 004
-- Project: Ratevo by Xoiex
-- Database: Supabase PostgreSQL
-- ============================================================================

-- Add phone column to businesses if not exists (for Cashfree customer_details)
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- ============================================================================
-- PAYMENTS TABLE
-- Stores one row per payment attempt (pending/paid/failed/refunded)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cashfree_order_id TEXT NOT NULL UNIQUE,
  cashfree_payment_id TEXT,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('monthly', 'yearly')),
  amount_paise INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method_label TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_business_id ON public.payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_owner_id ON public.payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_cashfree_order_id ON public.payments(cashfree_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Owner can view their own payments
DROP POLICY IF EXISTS "Owners can view own payments" ON public.payments;
CREATE POLICY "Owners can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = owner_id);

-- Service role (backend) manages payments
GRANT ALL ON public.payments TO service_role;
GRANT SELECT ON public.payments TO authenticated;

-- Updated_at trigger for payments
CREATE OR REPLACE FUNCTION public.update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payments_updated_at();

-- ============================================================================
-- WEBHOOK_EVENTS TABLE
-- Idempotency log for Cashfree webhooks (at-least-once delivery)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  cashfree_order_id TEXT NOT NULL,
  cashfree_payment_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE, -- event_type + order_id + payment_id (or event_id)
  payload_jsonb JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_order_id ON public.webhook_events(cashfree_order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_idempotency_key ON public.webhook_events(idempotency_key);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- No direct access for authenticated users (internal only)
-- Service role manages webhook events
GRANT ALL ON public.webhook_events TO service_role;
GRANT SELECT ON public.webhook_events TO authenticated;

-- ============================================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- Run these in Supabase SQL Editor after applying the migration
-- ============================================================================

-- 1. Verify businesses phone column
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'phone';

-- 2. Verify payments table
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'payments'
-- ORDER BY ordinal_position;

-- 3. Verify webhook_events table
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'webhook_events'
-- ORDER BY ordinal_position;

-- 4. Verify RLS policies
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename IN ('payments', 'webhook_events');

-- 5. Verify table privileges
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public'
-- AND table_name IN ('payments', 'webhook_events')
-- AND grantee IN ('anon', 'authenticated', 'service_role')
-- ORDER BY table_name, grantee;

-- 6. Verify triggers
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.payments'::regclass;