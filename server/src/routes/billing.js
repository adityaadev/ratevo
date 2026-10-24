import express from 'express'
import { supabase } from '../config/supabase.js'
import { authMiddleware } from '../middleware/auth.js'
import { BILLING_CONFIG, getSubscriptionStatus } from '../config/billing.js'

const router = express.Router()

// Initialize trial for a business (idempotent - only sets trial if not already set)
async function initializeTrial(businessId, supabaseClient) {
  const { data: business, error: bizError } = await supabaseClient
    .from('businesses')
    .select('trial_ends_at, trial_used, subscription_status')
    .eq('id', businessId)
    .single()

  if (bizError || !business) {
    throw new Error('Business not found')
  }

  // If trial already used or subscription status is not trial, don't reset
  if (business.trial_used || business.subscription_status !== 'trial') {
    return business
  }

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 7) // 7-day trial from config

  const { data: updated, error: updateError } = await supabaseClient
    .from('businesses')
    .update({
      trial_ends_at: trialEndsAt.toISOString(),
      trial_used: true,
      subscription_status: 'trial',
      updated_at: new Date().toISOString()
    })
    .eq('id', businessId)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  return updated
}

// GET /api/billing/status - Get current subscription/trial status for a business
router.get('/status', authMiddleware, async (req, res, next) => {
  try {
    const { business_id } = req.query
    
    if (!business_id) {
      return res.status(400).json({ message: 'business_id is required' })
    }

    // Verify ownership
    const { data: business, error: bizError } = await supabase()
      .from('businesses')
      .select('id, trial_ends_at, paid_until, subscription_status, subscription_plan, trial_used')
      .eq('id', business_id)
      .eq('owner_id', req.user.id)
      .single()

    if (bizError || !business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    // Initialize trial if not already set (idempotent)
    const trialEndsAt = business.trial_ends_at ? new Date(business.trial_ends_at) : null
    const paidUntil = business.paid_until ? new Date(business.paid_until) : null
    
    // Initialize trial if not set and status is trial
    if (business.subscription_status === 'trial' && !trialEndsAt) {
      const updated = await initializeTrial(business.id, supabase)
      return res.json(getSubscriptionStatus(
        updated.trial_ends_at ? new Date(updated.trial_ends_at) : null,
        updated.paid_until ? new Date(updated.paid_until) : null,
        updated.subscription_status,
        updated.subscription_plan
      ))
    }

    // Return current status
    const status = getSubscriptionStatus(
      trialEndsAt,
      paidUntil,
      business.subscription_status,
      business.subscription_plan
    )

    res.json({
      business_id: business.id,
      subscription_status: status.status,
      in_grace: status.inGrace,
      days_left: status.daysLeft,
      trial_ends_at: business.trial_ends_at,
      paid_until: business.paid_until,
      subscription_plan: business.subscription_plan,
      subscription_status: business.subscription_status,
      trial_used: business.trial_used,
      is_trial: business.subscription_status === 'trial',
      is_active: status.status === 'active',
      is_expired: status.status === 'expired',
      in_grace: status.inGrace
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/billing/initialize-trial - Explicitly initialize trial (for manual trigger)
router.post('/initialize-trial', authMiddleware, async (req, res, next) => {
  try {
    const { business_id } = req.body
    
    if (!business_id) {
      return res.status(400).json({ message: 'business_id is required' })
    }

    // Verify ownership
    const { data: business, error: bizError } = await supabase()
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('owner_id', req.user.id)
      .single()

    if (bizError || !business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    const updated = await initializeTrial(business_id, supabase)
    
    res.json({
      message: 'Trial initialized successfully',
      trial_ends_at: updated.trial_ends_at,
      subscription_status: updated.subscription_status
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/billing/subscribe - Create subscription (for future payment integration)
router.post('/subscribe', authMiddleware, async (req, res, next) => {
  try {
    const { business_id, plan_id } = req.body
    
    if (!business_id || !plan_id) {
      return res.status(400).json({ message: 'business_id and plan_id are required' })
    }

    const plan = BILLING_CONFIG.plans[plan_id]
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan' })
    }

    // Verify ownership
    const { data: business, error: bizError } = await supabase()
      .from('businesses')
      .select('id, subscription_status, trial_used')
      .eq('id', business_id)
      .eq('owner_id', req.user.id)
      .single()

    if (bizError || !business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    // Check if trial already used and not eligible for another trial
    if (business.trial_used && business.subscription_status === 'trial') {
      // Allow upgrade from trial
    } else if (business.trial_used && business.subscription_status !== 'trial') {
      // Trial already used and not in trial - would need payment
    }

    // Create subscription record (status will be updated after payment verification)
    const paidUntil = new Date()
    paidUntil.setDate(paidUntil.getDate() + plan.intervalDays)

    const { data: subscription, error: subError } = await supabase()
      .from('billing_subscriptions')
      .insert({
        business_id,
        plan_id,
        status: 'active', // Will be updated after payment verification
        amount_paise: plan.amountPaise,
        currency: BILLING_CONFIG.currency,
        paid_until: paidUntil.toISOString(),
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (subError) {
      throw subError
    }

    // Update business with subscription info
    const { data: updatedBusiness, error: updateError } = await supabase()
      .from('businesses')
      .update({
        subscription_status: 'active',
        subscription_plan: plan_id,
        paid_until: paidUntil.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', business_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    res.status(201).json({
      subscription: subscription,
      business: updatedBusiness,
      message: 'Subscription created. Payment verification required.'
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/billing/subscriptions - Get subscription history for a business
router.get('/subscriptions', authMiddleware, async (req, res, next) => {
  try {
    const { business_id } = req.query
    
    if (!business_id) {
      return res.status(400).json({ message: 'business_id is required' })
    }

    // Verify ownership
    const { data: business, error: bizError } = await supabase()
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('owner_id', req.user.id)
      .single()

    if (bizError || !business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    const { data: subscriptions, error } = await supabase()
      .from('billing_subscriptions')
      .select('*')
      .eq('business_id', business_id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({ subscriptions })
  } catch (err) {
    next(err)
  }
})

export default router