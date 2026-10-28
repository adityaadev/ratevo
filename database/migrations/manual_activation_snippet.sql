-- ============================================================================
-- Ratevo Manual Activation SQL Snippet
-- Use this in Supabase SQL Editor to manually activate a business
-- when Cashfree webhook fails or for admin/compensation purposes.
-- ============================================================================

-- ============================================================================
-- MANUAL ACTIVATION: Grant access to a business by business_id and plan_id
-- ============================================================================
-- USAGE:
--   1. Replace 'BUSINESS_UUID_HERE' with the actual business UUID
--   2. Replace 'monthly' or 'yearly' with the desired plan_id
--   3. Run in Supabase SQL Editor
--   4. Verify in Dashboard → Billing tab
-- ============================================================================

DO $$
DECLARE
  v_business_id UUID := 'BUSINESS_UUID_HERE';  -- REPLACE THIS
  v_plan_id TEXT := 'monthly';                  -- 'monthly' or 'yearly'
  v_amount_paise INTEGER;
  v_interval_days INTEGER;
  v_now TIMESTAMPTZ := NOW();
  v_paid_until TIMESTAMPTZ;
  v_subscription_id UUID;
BEGIN
  -- Validate plan and get config
  IF v_plan_id = 'monthly' THEN
    v_amount_paise := 9900;
    v_interval_days := 30;
  ELSIF v_plan_id = 'yearly' THEN
    v_amount_paise := 109900;
    v_interval_days := 365;
  ELSE
    RAISE EXCEPTION 'Invalid plan_id: %', v_plan_id;
  END IF;

  -- Calculate paid_until: max(now, current paid_until) + interval_days
  SELECT COALESCE(paid_until, v_now) INTO v_paid_until
  FROM public.businesses
  WHERE id = v_business_id;

  IF v_paid_until < v_now THEN
    v_paid_until := v_now;
  END IF;

  v_paid_until := v_paid_until + (v_interval_days || ' days')::INTERVAL;

  -- Update business
  UPDATE public.businesses
  SET
    subscription_status = 'active',
    subscription_plan = v_plan_id,
    paid_until = v_paid_until,
    updated_at = v_now
  WHERE id = v_business_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found: %', v_business_id;
  END IF;

  -- Insert into billing_subscriptions for audit trail
  INSERT INTO public.billing_subscriptions (
    business_id,
    plan_id,
    status,
    amount_paise,
    currency,
    paid_until,
    started_at,
    cashfree_order_id
  ) VALUES (
    v_business_id,
    v_plan_id,
    'active',
    v_amount_paise,
    'INR',
    v_paid_until,
    v_now,
    'manual_' || v_business_id || '_' || EXTRACT(EPOCH FROM v_now)::BIGINT
  ) RETURNING id INTO v_subscription_id;

  -- Insert into payments for history
  INSERT INTO public.payments (
    business_id,
    owner_id,
    cashfree_order_id,
    cashfree_payment_id,
    plan_id,
    amount_paise,
    currency,
    status,
    payment_method_label,
    paid_at
  )
  SELECT
    b.id,
    b.owner_id,
    'manual_' || b.id || '_' || EXTRACT(EPOCH FROM v_now)::BIGINT,
    'manual_payment',
    v_plan_id,
    v_amount_paise,
    'INR',
    'paid',
    'Manual Activation',
    v_now
  FROM public.businesses b
  WHERE b.id = v_business_id;

  RAISE NOTICE 'SUCCESS: Business % activated with % plan. Paid until: %', v_business_id, v_plan_id, v_paid_until;
END $$;

-- ============================================================================
-- VERIFY ACTIVATION
-- ============================================================================
-- Run after the DO block above to confirm:
-- SELECT id, name, subscription_status, subscription_plan, paid_until, trial_ends_at, trial_used
-- FROM public.businesses
-- WHERE id = 'BUSINESS_UUID_HERE';

-- SELECT * FROM public.billing_subscriptions WHERE business_id = 'BUSINESS_UUID_HERE' ORDER BY created_at DESC;
-- SELECT * FROM public.payments WHERE business_id = 'BUSINESS_UUID_HERE' ORDER BY created_at DESC;