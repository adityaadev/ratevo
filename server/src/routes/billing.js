import express from 'express'
import { supabase } from '../config/supabase.js'
import { authMiddleware } from '../middleware/auth.js'
import { BILLING_CONFIG, getSubscriptionStatus, calculatePaidUntil } from '../config/billing.js'
import { createOrderSchema } from '../utils/validation.js'
import { createCashfreeOrder, getCashfreeOrder, verifyCashfreeWebhookSignature, buildWebhookIdempotencyKey, buildCustomerDetails, buildOrderMeta } from '../config/cashfree.js'
import { PAYMENTS_PROVIDER } from '../config/features.js'
import { sendPaymentReceiptEmail } from '../services/email.js'

const router = express.Router()

// ============================================================================
// TRIAL INITIALIZATION
// ============================================================================

async function initializeTrial(businessId, supabaseClient) {
  const { data: business, error: bizError } = await supabaseClient
    .from('businesses')
    .select('trial_ends_at, trial_used, subscription_status')
    .eq('id', businessId)
    .single()

  if (bizError || !business) {
    throw new Error('Business not found')
  }

  if (business.trial_used || business.subscription_status !== 'trial') {
    return business
  }

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + BILLING_CONFIG.freeTrialDays)

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

// ============================================================================
// GET /api/billing/status - Get current subscription/trial status
// ============================================================================
router.get('/status', authMiddleware, async (req, res, next) => {
  try {
    const { business_id, order_id } = req.query

    if (!business_id) {
      return res.status(400).json({ message: 'business_id is required' })
    }

    const { data: business, error: bizError } = await supabase()
      .from('businesses')
      .select('id, trial_ends_at, paid_until, subscription_status, subscription_plan, trial_used')
      .eq('id', business_id)
      .eq('owner_id', req.user.id)
      .single()

    if (bizError || !business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    const trialEndsAt = business.trial_ends_at ? new Date(business.trial_ends_at) : null
    const paidUntil = business.paid_until ? new Date(business.paid_until) : null

    if (business.subscription_status === 'trial' && !trialEndsAt) {
      const updated = await initializeTrial(business.id, supabase)
      return res.json(getSubscriptionStatus(
        updated.trial_ends_at ? new Date(updated.trial_ends_at) : null,
        updated.paid_until ? new Date(updated.paid_until) : null,
        updated.subscription_status,
        updated.subscription_plan
      ))
    }

    const status = getSubscriptionStatus(trialEndsAt, paidUntil, business.subscription_status, business.subscription_plan)

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
      in_grace: status.inGrace,
      // Include order_id if provided (for result page polling)
      ...(order_id && { order_id })
    })
  } catch (err) {
    next(err)
  }
})

// ============================================================================
// POST /api/billing/initialize-trial - Explicitly initialize trial
// ============================================================================
router.post('/initialize-trial', authMiddleware, async (req, res, next) => {
  try {
    const { business_id } = req.body

    if (!business_id) {
      return res.status(400).json({ message: 'business_id is required' })
    }

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

// ============================================================================
// POST /api/billing/orders - Create Cashfree order (requires PAYMENTS_PROVIDER=cashfree)
// ============================================================================
router.post('/orders', authMiddleware, async (req, res, next) => {
  try {
    if (PAYMENTS_PROVIDER !== 'cashfree') {
      return res.status(404).json({ message: 'Payments not enabled' })
    }

    const parseResult = createOrderSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid input', errors: parseResult.error.flatten() })
    }

    const { business_id, plan_id } = parseResult.data

    // Verify ownership
    const { data: business, error: bizError } = await supabase()
      .from('businesses')
      .select('id, owner_id, name, phone')
      .eq('id', business_id)
      .eq('owner_id', req.user.id)
      .single()

    if (bizError || !business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    const plan = BILLING_CONFIG.plans[plan_id]
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan' })
    }

    // Generate unique order_id (≤40 chars alphanumeric)
    const orderId = `ord_${business_id.slice(0, 8)}_${Date.now()}`

    // Build Cashfree order
    const customerDetails = buildCustomerDetails(business, req.user)
    const orderMeta = buildOrderMeta(process.env.CLIENT_URL || 'https://ratevo.site', orderId)

    const cfOrder = await createCashfreeOrder({
      order_id: orderId,
      order_amount: plan.amountPaise / 100, // Convert paise to rupees
      customer_details: customerDetails,
      order_meta: orderMeta,
    })

    // Store pending payment
    const { data: payment, error: paymentError } = await supabase()
      .from('payments')
      .insert({
        business_id,
        owner_id: req.user.id,
        cashfree_order_id: orderId,
        plan_id,
        amount_paise: plan.amountPaise,
        currency: BILLING_CONFIG.currency,
        status: 'pending',
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Failed to store pending payment:', { code: paymentError.code, orderId })
      // Don't fail the request - order was created at Cashfree
    }

    // Also create billing_subscriptions record for audit trail
    await supabase()
      .from('billing_subscriptions')
      .insert({
        business_id,
        plan_id,
        status: 'pending',
        cashfree_order_id: orderId,
        amount_paise: plan.amountPaise,
        currency: BILLING_CONFIG.currency,
      })

    console.log('Created Cashfree order', { orderId, businessId: business_id, planId: plan_id })

    res.json({
      payment_session_id: cfOrder.payment_session_id,
      order_id: cfOrder.order_id,
    })
  } catch (err) {
    console.error('Create order error:', err.message)
    next(err)
  }
})

// ============================================================================
// GET /api/billing/verify - Verify order status from Cashfree (for result page polling)
// ============================================================================
router.get('/verify', authMiddleware, async (req, res, next) => {
  try {
    if (PAYMENTS_PROVIDER !== 'cashfree') {
      return res.status(404).json({ message: 'Payments not enabled' })
    }

    const { order_id, business_id } = req.query

    if (!order_id || !business_id) {
      return res.status(400).json({ message: 'order_id and business_id are required' })
    }

    // Verify ownership
    const { data: business, error: bizError } = await supabase()
      .from('businesses')
      .select('id, paid_until, subscription_status')
      .eq('id', business_id)
      .eq('owner_id', req.user.id)
      .single()

    if (bizError || !business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    // Get order from Cashfree
    const cfOrder = await getCashfreeOrder(order_id)

    // Verify order belongs to this business (via our payments table)
    const { data: payment } = await supabase()
      .from('payments')
      .select('id, plan_id, amount_paise, currency')
      .eq('cashfree_order_id', order_id)
      .eq('business_id', business_id)
      .single()

    if (!payment) {
      return res.status(404).json({ message: 'Order not found for this business' })
    }

    // Verify amount and currency match
    if (cfOrder.order_amount !== payment.amount_paise / 100) {
      console.warn('Amount mismatch', { cfAmount: cfOrder.order_amount, storedAmount: payment.amount_paise / 100, orderId: order_id })
      return res.status(400).json({ message: 'Order amount mismatch', verified: false })
    }
    if (cfOrder.order_currency !== payment.currency) {
      return res.status(400).json({ message: 'Order currency mismatch', verified: false })
    }

    const isPaid = cfOrder.order_status === 'PAID'

    if (isPaid) {
      // Check if already processed (idempotency)
      const { data: existingPayment } = await supabase()
        .from('payments')
        .select('status, paid_at')
        .eq('cashfree_order_id', order_id)
        .single()

      if (existingPayment && existingPayment.status === 'paid') {
        return res.json({ verified: true, already_processed: true, paid_until: business.paid_until })
      }

      // Grant access
      const plan = BILLING_CONFIG.plans[payment.plan_id]
      const newPaidUntil = calculatePaidUntil(payment.plan_id, business.paid_until ? new Date(business.paid_until) : new Date())

      // Update business
      await supabase()
        .from('businesses')
        .update({
          subscription_status: 'active',
          subscription_plan: payment.plan_id,
          paid_until: newPaidUntil.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', business_id)

      // Update payments table
      await supabase()
        .from('payments')
        .update({
          status: 'paid',
          cashfree_payment_id: cfOrder.payment_id || cfOrder.cf_payment_id,
          payment_method_label: cfOrder.payment_method,
          paid_at: new Date().toISOString(),
        })
        .eq('cashfree_order_id', order_id)

      // Update billing_subscriptions
      await supabase()
        .from('billing_subscriptions')
        .update({
          status: 'active',
          cashfree_payment_id: cfOrder.payment_id || cfOrder.cf_payment_id,
          paid_until: newPaidUntil.toISOString(),
        })
        .eq('cashfree_order_id', order_id)

      console.log('Payment verified and access granted', { orderId: order_id, businessId: business_id, planId: payment.plan_id })

      // Send payment receipt email (fire and forget)
      try {
        const { data: biz } = await supabase()
          .from('businesses')
          .select('owner_id, name')
          .eq('id', business_id)
          .single()
        if (biz) {
          const { data: ownerProfile } = await supabase()
            .from('profiles')
            .select('email')
            .eq('id', biz.owner_id)
            .single()
          if (ownerProfile?.email) {
            await sendPaymentReceiptEmail({
              to: ownerProfile.email,
              businessName: biz.name,
              planId: payment.plan_id,
              amountPaise: payment.amount_paise,
              orderId: order_id,
              paidAt: new Date().toISOString(),
            })
          }
        }
      } catch (emailErr) {
        console.warn('Failed to send payment receipt email:', { orderId: order_id, error: emailErr.message })
      }

      return res.json({ verified: true, paid_until: newPaidUntil.toISOString() })
    }

    // Not paid yet
    res.json({ verified: false, order_status: cfOrder.order_status })
  } catch (err) {
    console.error('Verify order error:', err.message)
    next(err)
  }
})

// ============================================================================
// GET /api/billing/payments - Get payment history for a business
// ============================================================================
router.get('/payments', authMiddleware, async (req, res, next) => {
  try {
    const { business_id } = req.query

    if (!business_id) {
      return res.status(400).json({ message: 'business_id is required' })
    }

    const { data: business, error: bizError } = await supabase()
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('owner_id', req.user.id)
      .single()

    if (bizError || !business) {
      return res.status(404).json({ message: 'Business not found' })
    }

    const { data: payments, error } = await supabase()
      .from('payments')
      .select('*')
      .eq('business_id', business_id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({ payments })
  } catch (err) {
    next(err)
  }
})

// ============================================================================
// POST /api/billing/webhook - Cashfree webhook (requires PAYMENTS_PROVIDER=cashfree)
// NOTE: This route uses raw body parser mounted in index.js
// ============================================================================
router.post('/webhook', async (req, res, next) => {
  try {
    if (PAYMENTS_PROVIDER !== 'cashfree') {
      return res.status(404).send('Not found')
    }

    const signature = req.headers['x-webhook-signature']
    const timestamp = req.headers['x-webhook-timestamp']
    const rawBody = req.rawBody

    if (!rawBody) {
      console.warn('Webhook received without raw body')
      return res.status(400).send('Missing raw body')
    }

    // Verify signature
    if (!verifyCashfreeWebhookSignature(rawBody, signature, timestamp)) {
      console.warn('Invalid webhook signature', { hasSignature: !!signature, hasTimestamp: !!timestamp })
      return res.status(401).send('Invalid signature')
    }

    const payload = JSON.parse(rawBody)
    const eventType = payload.type || payload.event_type
    const idempotencyKey = buildWebhookIdempotencyKey(payload)
    const orderId = payload.data?.order?.order_id || payload.data?.order_id
    const paymentId = payload.data?.payment?.payment_id || payload.data?.payment_id

    // Idempotency check
    const { data: existingEvent } = await supabase()
      .from('webhook_events')
      .select('id, processed')
      .eq('idempotency_key', idempotencyKey)
      .single()

    if (existingEvent) {
      console.log('Duplicate webhook received, skipping', { idempotencyKey, eventType })
      return res.status(200).send('OK')
    }

    // Log webhook event
    const { error: logError } = await supabase()
      .from('webhook_events')
      .insert({
        event_type: eventType,
        cashfree_order_id: orderId,
        cashfree_payment_id: paymentId,
        idempotency_key: idempotencyKey,
        payload_jsonb: payload,
      })

    if (logError) {
      console.error('Failed to log webhook event:', { code: logError.code, idempotencyKey })
      // Continue processing even if logging fails
    }

    // Only process payment_success for granting access
    if (eventType === 'payment_success') {
      // Verify order status from Cashfree before granting
      try {
        const cfOrder = await getCashfreeOrder(orderId)

        if (cfOrder.order_status !== 'PAID') {
          console.warn('Webhook payment_success but order not PAID', { orderId, cfStatus: cfOrder.order_status })
          return res.status(200).send('OK')
        }

        // Find our payment record
        const { data: payment, error: paymentError } = await supabase()
          .from('payments')
          .select('id, business_id, plan_id, amount_paise, currency, status')
          .eq('cashfree_order_id', orderId)
          .single()

        if (paymentError || !payment) {
          console.warn('Payment record not found for webhook', { orderId, error: paymentError?.message })
          return res.status(200).send('OK')
        }

        // Verify amount and currency
        if (cfOrder.order_amount !== payment.amount_paise / 100 || cfOrder.order_currency !== payment.currency) {
          console.error('Webhook amount/currency mismatch', { cfAmount: cfOrder.order_amount, cfCurrency: cfOrder.order_currency, storedAmount: payment.amount_paise / 100, storedCurrency: payment.currency, orderId })
          return res.status(200).send('OK')
        }

        // Check if already processed
        if (payment.status === 'paid') {
          console.log('Payment already processed, skipping grant', { orderId })
          // Mark webhook as processed
          await supabase()
            .from('webhook_events')
            .update({ processed: true })
            .eq('idempotency_key', idempotencyKey)
          return res.status(200).send('OK')
        }

        // Get business to calculate new paid_until
        const { data: business } = await supabase()
          .from('businesses')
          .select('paid_until, subscription_status')
          .eq('id', payment.business_id)
          .single()

        if (!business) {
          console.error('Business not found for payment', { businessId: payment.business_id, orderId })
          return res.status(200).send('OK')
        }

        // Grant access
        const newPaidUntil = calculatePaidUntil(payment.plan_id, business.paid_until ? new Date(business.paid_until) : new Date())

        await supabase()
          .from('businesses')
          .update({
            subscription_status: 'active',
            subscription_plan: payment.plan_id,
            paid_until: newPaidUntil.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.business_id)

        await supabase()
          .from('payments')
          .update({
            status: 'paid',
            cashfree_payment_id: paymentId,
            payment_method_label: cfOrder.payment_method,
            paid_at: new Date().toISOString(),
          })
          .eq('cashfree_order_id', orderId)

        await supabase()
          .from('billing_subscriptions')
          .update({
            status: 'active',
            cashfree_payment_id: paymentId,
            paid_until: newPaidUntil.toISOString(),
          })
          .eq('cashfree_order_id', orderId)

        console.log('Webhook: Access granted', { orderId, businessId: payment.business_id, planId: payment.plan_id })

        // Send payment receipt email (fire and forget)
        try {
          const { data: profile } = await supabase()
            .from('profiles')
            .select('email')
            .eq('id', payment.business_id)
            .single()
          // Note: payment.business_id is the business ID, we need owner_id
          // Let's get the business owner email instead
          const { data: biz } = await supabase()
            .from('businesses')
            .select('owner_id, name')
            .eq('id', payment.business_id)
            .single()
          if (biz) {
            const { data: ownerProfile } = await supabase()
              .from('profiles')
              .select('email')
              .eq('id', biz.owner_id)
              .single()
            if (ownerProfile?.email) {
              await sendPaymentReceiptEmail({
                to: ownerProfile.email,
                businessName: biz.name,
                planId: payment.plan_id,
                amountPaise: payment.amount_paise,
                orderId: orderId,
                paidAt: new Date().toISOString(),
              })
            }
          }
        } catch (emailErr) {
          console.warn('Failed to send payment receipt email:', { orderId, error: emailErr.message })
        }
      } catch (verifyErr) {
        console.error('Webhook verification failed:', { orderId, error: verifyErr.message })
        // Still return 200 to stop retries, but log the error
      }
    }

    // Mark webhook as processed
    await supabase()
      .from('webhook_events')
      .update({ processed: true })
      .eq('idempotency_key', idempotencyKey)

    res.status(200).send('OK')
  } catch (err) {
    console.error('Webhook error:', err.message)
    // Return 200 for known events to stop retries, 500 for unknown errors
    res.status(500).send('Internal error')
  }
})

// ============================================================================
// GET /api/billing/subscriptions - Get subscription history
// ============================================================================
router.get('/subscriptions', authMiddleware, async (req, res, next) => {
  try {
    const { business_id } = req.query

    if (!business_id) {
      return res.status(400).json({ message: 'business_id is required' })
    }

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