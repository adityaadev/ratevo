-- ============================================================================
-- Ratevo Billing Fields Migration
-- Version: 003
-- Project: Ratevo by Xoiex
-- Database: Supabase PostgreSQL
-- ============================================================================

-- Add billing/trial fields to businesses table
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'grace', 'expired')),
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE;

-- Index for querying expired trials/subscriptions
CREATE INDEX IF NOT EXISTS idx_businesses_trial_ends_at ON public.businesses(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_businesses_paid_until ON public.businesses(paid_until);
CREATE INDEX IF NOT EXISTS idx_businesses_subscription_status ON public.businesses(subscription_status);

-- Add updated_at trigger for new columns (already exists from 001 migration)
-- The existing update_businesses_updated_at trigger will fire on any update

-- RLS policies for billing fields (owners can view their own billing info)
-- Existing policies on businesses table already cover this since they filter by owner_id

-- Grant privileges
GRANT SELECT, UPDATE (trial_ends_at, paid_until, subscription_status, subscription_plan, trial_used) 
  ON public.businesses TO authenticated;

-- Create billing_subscriptions table for audit trail and Cashfree integration
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('monthly', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('trial', 'active', 'grace', 'expired', 'cancelled')),
  cashfree_order_id TEXT UNIQUE,
  cashfree_payment_id TEXT,
  amount_paise INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  trial_ends_at TIMESTAMPTZ,
  paid_until TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_business_id ON public.billing_subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_cashfree_order ON public.billing_subscriptions(cashfree_order_id);

ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Owner can view their own subscriptions
DROP POLICY IF EXISTS "Owners can view own subscriptions" ON public.billing_subscriptions;
CREATE POLICY "Owners can view own subscriptions"
  ON public.billing_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE public.businesses.id = public.billing_subscriptions.business_id
      AND public.businesses.owner_id = auth.uid()
    )
  );

-- Service role (backend) manages subscriptions
GRANT ALL ON public.billing_subscriptions TO service_role;
GRANT SELECT ON public.billing_subscriptions TO authenticated;

-- Updated_at trigger for billing_subscriptions
CREATE OR REPLACE FUNCTION public.update_billing_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_billing_subscriptions_updated_at ON public.billing_subscriptions;
CREATE TRIGGER update_billing_subscriptions_updated_at
  BEFORE UPDATE ON public.billing_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_billing_subscriptions_updated_at();

-- ============================================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- Run these in Supabase SQL Editor after applying the migration
-- ============================================================================

-- 1. Verify businesses columns
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'businesses'
-- AND column_name IN ('trial_ends_at', 'paid_until', 'subscription_status', 'subscription_plan', 'trial_used')
-- ORDER BY ordinal_position;

-- 2. Verify billing_subscriptions table
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'billing_subscriptions'
-- ORDER BY ordinal_position;

-- 3. Verify RLS policies
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'billing_subscriptions';

-- 3. Verify table privileges
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public'
-- AND table_name IN ('businesses', 'billing_subscriptions')
-- AND grantee IN ('anon', 'authenticated', 'service_role')
-- ORDER BY table_name, grantee;