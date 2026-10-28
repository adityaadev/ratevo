import { createHmac, timingSafeEqual } from 'crypto'

// Cashfree API Configuration
// Uses stable API version 2023-08-01 (GA)
// Docs: https://developer.cashfree.com/docs/api-reference/introduction

const CASHFREE_CONFIG = {
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  env: process.env.CASHFREE_ENV || 'sandbox', // 'sandbox' | 'production'
  apiVersion: process.env.CASHFREE_API_VERSION || '2023-08-01',
  webhookSecret: process.env.CASHFREE_WEBHOOK_SECRET,
}

function getBaseUrl() {
  return CASHFREE_CONFIG.env === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg'
}

function getHeaders() {
  return {
    'x-api-version': CASHFREE_CONFIG.apiVersion,
    'x-client-id': CASHFREE_CONFIG.appId,
    'x-client-secret': CASHFREE_CONFIG.secretKey,
    'Content-Type': 'application/json',
  }
}

/**
 * Create a Cashfree Order
 * @param {Object} params
 * @param {string} params.order_id - Unique order ID (≤40 alphanumeric)
 * @param {number} params.order_amount - Amount in INR (float, e.g., 99.00)
 * @param {Object} params.customer_details - Required: customer_id, customer_name, customer_email, customer_phone
 * @param {Object} params.order_meta - Required: return_url, notify_url
 * @returns {Promise<Object>} Cashfree order response with payment_session_id
 */
export async function createCashfreeOrder({ order_id, order_amount, customer_details, order_meta }) {
  if (!CASHFREE_CONFIG.appId || !CASHFREE_CONFIG.secretKey) {
    throw new Error('Cashfree not configured: set CASHFREE_APP_ID and CASHFREE_SECRET_KEY')
  }

  const body = {
    order_id,
    order_amount,
    order_currency: 'INR',
    customer_details,
    order_meta,
  }

  const response = await fetch(`${getBaseUrl()}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data.message || `Cashfree create order failed: ${response.status}`
    throw new Error(message)
  }

  return data // { payment_session_id, order_id, cftoken, ... }
}

/**
 * Get Order from Cashfree (server-side verification)
 * @param {string} order_id
 * @returns {Promise<Object>} Order details including order_status, order_amount, order_currency
 */
export async function getCashfreeOrder(order_id) {
  if (!CASHFREE_CONFIG.appId || !CASHFREE_CONFIG.secretKey) {
    throw new Error('Cashfree not configured')
  }

  const response = await fetch(`${getBaseUrl()}/orders/${order_id}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data.message || `Cashfree get order failed: ${response.status}`
    throw new Error(message)
  }

  return data
}

/**
 * Verify Cashfree Webhook Signature
 * Per docs: HMAC-SHA256(raw_body + timestamp, webhook_secret) === signature
 * Headers: x-webhook-signature, x-webhook-timestamp
 * Reject if timestamp > 5 minutes old
 * @param {string} rawBody - Raw request body (string)
 * @param {string} signature - x-webhook-signature header
 * @param {string} timestamp - x-webhook-timestamp header
 * @returns {boolean}
 */
export function verifyCashfreeWebhookSignature(rawBody, signature, timestamp) {
  if (!CASHFREE_CONFIG.webhookSecret) {
    console.error('Cashfree webhook secret not configured')
    return false
  }

  if (!signature || !timestamp) {
    return false
  }

  // Reject stale webhooks (> 5 minutes)
  const webhookTime = parseInt(timestamp, 10)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - webhookTime) > 300) {
    console.warn('Cashfree webhook timestamp too old', { webhookTime, now, diff: Math.abs(now - webhookTime) })
    return false
  }

  const expectedSignature = createHmac('sha256', CASHFREE_CONFIG.webhookSecret)
    .update(rawBody + timestamp)
    .digest('hex')

  // Constant-time comparison
  const sigBuffer = Buffer.from(signature, 'hex')
  const expectedBuffer = Buffer.from(expectedSignature, 'hex')

  if (sigBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(sigBuffer, expectedBuffer)
}

/**
 * Build idempotency key for webhook_events table
 * Cashfree sends event_id in payload for some events; fallback to order_id + payment_id + event_type
 * @param {Object} payload - Webhook payload
 * @returns {string}
 */
export function buildWebhookIdempotencyKey(payload) {
  const eventId = payload?.data?.event_id || payload?.event_id
  const orderId = payload?.data?.order?.order_id || payload?.data?.order_id
  const paymentId = payload?.data?.payment?.payment_id || payload?.data?.payment_id
  const eventType = payload?.type || payload?.event_type

  if (eventId) {
    return `evt_${eventId}`
  }
  return `${eventType}_${orderId}_${paymentId || 'no_payment_id'}`
}

/**
 * Extract customer details for Cashfree order
 * Phone is mandatory per Cashfree docs (E.164 format)
 * @param {Object} business - Business row from DB
 * @param {Object} user - Auth user row
 * @returns {Object} customer_details
 */
export function buildCustomerDetails(business, user) {
  const phone = business.phone || user.phone || ''
  // Ensure E.164 format for Indian numbers
  let formattedPhone = phone.replace(/\D/g, '')
  if (formattedPhone.startsWith('0')) {
    formattedPhone = formattedPhone.slice(1)
  }
  if (formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone
  }
  if (!formattedPhone.startsWith('91') && formattedPhone.length > 10) {
    formattedPhone = '91' + formattedPhone.slice(-10)
  }

  return {
    customer_id: business.owner_id,
    customer_name: business.name || user.email?.split('@')[0] || 'Customer',
    customer_email: user.email,
    customer_phone: formattedPhone || '919999999999', // Fallback dummy - should not happen in production
  }
}

/**
 * Extract order meta for Cashfree order
 * @param {string} baseUrl - Client base URL (e.g., https://ratevo.site)
 * @param {string} orderId - Order ID
 * @returns {Object} order_meta
 */
export function buildOrderMeta(baseUrl, orderId) {
  return {
    return_url: `${baseUrl}/billing/result?order_id=${orderId}`,
    notify_url: `${process.env.API_BASE_URL || baseUrl}/api/billing/webhook`,
    // payment_methods: ['upi', 'card', 'netbanking', 'wallet'], // Allow all
  }
}