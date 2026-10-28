import express from 'express'
import { supabase } from '../config/supabase.js'
import { sendTrialReminderEmail } from '../services/email.js'

const router = express.Router()

// Idempotency key prefix for cron job runs
const CRON_IDEMPOTENCY_PREFIX = 'trial_reminder_'

/**
 * Verify cron secret
 * This endpoint should only be called by a trusted scheduler (e.g., Render cron, GitHub Actions, Vercel Cron)
 */
function verifyCronSecret(req, res, next) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return res.status(500).json({ message: 'Cron not configured' })
  }
  
  const providedSecret = req.headers['x-cron-secret'] || req.query.secret
  if (providedSecret !== cronSecret) {
    return res.status(401).json({ message: 'Invalid cron secret' })
  }
  
  next()
}

/**
 * GET /api/cron/trial-reminders
 * Protected cron endpoint to send trial reminder emails
 * Runs daily to check for trials ending in 2 days, 1 day, and expired today
 */
router.get('/trial-reminders', verifyCronSecret, async (req, res, next) => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Calculate target dates
    const twoDaysFromNow = new Date(today)
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
    
    const oneDayFromNow = new Date(today)
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1)
    
    // End of today for expired check
    const endOfToday = new Date(today)
    endOfToday.setDate(endOfToday.getDate() + 1)
    endOfToday.setMilliseconds(-1)

    // Idempotency keys for this run
    const runDateKey = today.toISOString().split('T')[0] // YYYY-MM-DD
    const idempotencyKeys = {
      two_days: `${CRON_IDEMPOTENCY_PREFIX}two_days_${runDateKey}`,
      last_day: `${CRON_IDEMPOTENCY_PREFIX}last_day_${runDateKey}`,
      expired: `${CRON_IDEMPOTENCY_PREFIX}expired_${runDateKey}`,
    }

    // Check if already run today (using webhook_events table for idempotency)
    const { data: existingRuns } = await supabase()
      .from('webhook_events')
      .select('idempotency_key')
      .in('idempotency_key', Object.values(idempotencyKeys))

    const completedKeys = new Set(existingRuns?.map(r => r.idempotency_key) || [])
    const results = { two_days: 0, last_day: 0, expired: 0, errors: [] }

    // Helper to log idempotency
    async function logIdempotency(key, type, payload) {
      await supabase()
        .from('webhook_events')
        .insert({
          event_type: `cron_${type}`,
          cashfree_order_id: key,
          idempotency_key: key,
          payload_jsonb: payload,
          processed: true,
        })
    }

    // 1. Trials ending in 2 days
    if (!completedKeys.has(idempotencyKeys.two_days)) {
      const { data: businesses } = await supabase()
        .from('businesses')
        .select('id, name, owner_id, trial_ends_at, subscription_status')
        .eq('subscription_status', 'trial')
        .gte('trial_ends_at', twoDaysFromNow.toISOString())
        .lt('trial_ends_at', oneDayFromNow.toISOString())

      if (businesses && businesses.length > 0) {
        // Get owner emails
        const ownerIds = [...new Set(businesses.map(b => b.owner_id))]
        const { data: profiles } = await supabase()
          .from('profiles')
          .select('id, email')
          .in('id', ownerIds)

        const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || [])

        for (const biz of businesses) {
          const email = emailMap.get(biz.owner_id)
          if (email) {
            const result = await sendTrialReminderEmail({
              to: email,
              businessName: biz.name,
              trialEndsAt: biz.trial_ends_at,
              daysLeft: 2,
              type: 'two_days',
            })
            if (result.success) results.two_days++
            else results.errors.push({ type: 'two_days', business: biz.id, error: result.error })
          }
        }
      }
      await logIdempotency(idempotencyKeys.two_days, 'trial_reminder_two_days', { count: results.two_days })
    }

    // 2. Trials ending today (last day)
    if (!completedKeys.has(idempotencyKeys.last_day)) {
      const { data: businesses } = await supabase()
        .from('businesses')
        .select('id, name, owner_id, trial_ends_at, subscription_status')
        .eq('subscription_status', 'trial')
        .gte('trial_ends_at', oneDayFromNow.toISOString())
        .lt('trial_ends_at', endOfToday.toISOString())

      if (businesses && businesses.length > 0) {
        const ownerIds = [...new Set(businesses.map(b => b.owner_id))]
        const { data: profiles } = await supabase()
          .from('profiles')
          .select('id, email')
          .in('id', ownerIds)

        const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || [])

        for (const biz of businesses) {
          const email = emailMap.get(biz.owner_id)
          if (email) {
            const result = await sendTrialReminderEmail({
              to: email,
              businessName: biz.name,
              trialEndsAt: biz.trial_ends_at,
              daysLeft: 1,
              type: 'last_day',
            })
            if (result.success) results.last_day++
            else results.errors.push({ type: 'last_day', business: biz.id, error: result.error })
          }
        }
      }
      await logIdempotency(idempotencyKeys.last_day, 'trial_reminder_last_day', { count: results.last_day })
    }

    // 3. Trials expired today (transition to grace/expired)
    if (!completedKeys.has(idempotencyKeys.expired)) {
      const { data: businesses } = await supabase()
        .from('businesses')
        .select('id, name, owner_id, trial_ends_at, subscription_status')
        .eq('subscription_status', 'trial')
        .lt('trial_ends_at', today.toISOString())

      if (businesses && businesses.length > 0) {
        // Update expired trials to grace period
        for (const biz of businesses) {
          const trialEnd = new Date(biz.trial_ends_at)
          const graceEnd = new Date(trialEnd)
          graceEnd.setDate(graceEnd.getDate() + 5) // 5-day grace period
          
          if (graceEnd > now) {
            await supabase()
              .from('businesses')
              .update({ subscription_status: 'grace', updated_at: now.toISOString() })
              .eq('id', biz.id)
          } else {
            await supabase()
              .from('businesses')
              .update({ subscription_status: 'expired', updated_at: now.toISOString() })
              .eq('id', biz.id)
          }
        }

        // Send expired notifications
        const ownerIds = [...new Set(businesses.map(b => b.owner_id))]
        const { data: profiles } = await supabase()
          .from('profiles')
          .select('id, email')
          .in('id', ownerIds)

        const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || [])

        for (const biz of businesses) {
          const email = emailMap.get(biz.owner_id)
          if (email) {
            const result = await sendTrialReminderEmail({
              to: email,
              businessName: biz.name,
              trialEndsAt: biz.trial_ends_at,
              daysLeft: 0,
              type: 'expired',
            })
            if (result.success) results.expired++
            else results.errors.push({ type: 'expired', business: biz.id, error: result.error })
          }
        }
      }
      await logIdempotency(idempotencyKeys.expired, 'trial_reminder_expired', { count: results.expired, updated: businesses?.length || 0 })
    }

    console.log('Cron trial reminders completed', results)
    res.json({ success: true, results, runDate: runDateKey })
  } catch (err) {
    console.error('Cron trial reminders error:', err.message)
    next(err)
  }
})

/**
 * GET /api/cron/health
 * Health check for cron endpoint
 */
router.get('/health', verifyCronSecret, (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router