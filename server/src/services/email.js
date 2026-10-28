// Email service using Resend
// Docs: https://resend.com/docs/api-reference/emails/send-email

import { Resend } from 'resend'

let resend = null

function getResend() {
  if (resend) return resend
  
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('Resend API key not configured. Emails will not be sent.')
    return null
  }
  
  try {
    resend = new Resend(apiKey)
    return resend
  } catch (err) {
    console.error('Failed to initialize Resend:', err.message)
    return null
  }
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'Ratevo <noreply@ratevo.site>'
const SUPPORT_EMAIL = 'ratevo.business@gmail.com'
const CLIENT_URL = process.env.CLIENT_URL || 'https://ratevo.site'

/**
 * Send trial reminder email
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.businessName - Business name
 * @param {string} params.trialEndsAt - ISO date string
 * @param {number} params.daysLeft - Days remaining in trial
 * @param {string} params.type - 'two_days' | 'last_day' | 'expired'
 */
export async function sendTrialReminderEmail({ to, businessName, trialEndsAt, daysLeft, type }) {
  const client = getResend()
  if (!client) {
    console.warn('Email not sent: Resend not configured', { to, type })
    return { success: false, reason: 'Resend not configured' }
  }

  const trialEndDate = new Date(trialEndsAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const subjectMap = {
    two_days: `Your Ratevo trial ends in 2 days — ${businessName}`,
    last_day: `Your Ratevo trial ends today — ${businessName}`,
    expired: `Your Ratevo trial has ended — ${businessName}`,
  }

  const messageMap = {
    two_days: `Your 7-day free trial for <strong>${businessName}</strong> ends in <strong>2 days</strong> (on ${trialEndDate}).`,
    last_day: `Your 7-day free trial for <strong>${businessName}</strong> ends <strong>today</strong> (${trialEndDate}).`,
    expired: `Your 7-day free trial for <strong>${businessName}</strong> has ended.`,
  }

  const actionMap = {
    two_days: 'Upgrade now to continue uninterrupted',
    last_day: 'Upgrade now to avoid interruption',
    expired: 'Reactivate your account',
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #000; border-radius: 12px; padding: 32px; color: #fff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Ratevo</h1>
          <p style="margin: 8px 0 0; color: #888; font-size: 14px;">by Xoiex</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;">
        
        <p style="font-size: 16px; margin: 0 0 16px;">Hi there,</p>
        
        <p style="font-size: 16px; margin: 0 0 24px;">${messageMap[type]}</p>
        
        <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Plan</p>
          <p style="margin: 0; font-size: 20px; font-weight: 700;">Monthly — ₹99/month</p>
          <p style="margin: 8px 0 0; color: #888; font-size: 14px;">Limited time offer (regular ₹149/month)</p>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${CLIENT_URL}/dashboard/settings" 
             style="background: #fff; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            ${actionMap[type]}
          </a>
        </div>
        
        <p style="font-size: 14px; color: #888; margin: 24px 0 0;">
          If you have any questions, reply to this email or contact us at 
          <a href="mailto:${SUPPORT_EMAIL}" style="color: #fff; text-decoration: underline;">${SUPPORT_EMAIL}</a>
          or WhatsApp <a href="https://wa.me/918887471855" style="color: #fff; text-decoration: underline;">+91 88874 71855</a>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;">
        
        <p style="font-size: 12px; color: #666; margin: 0; text-align: center;">
          Ratevo by Xoiex • Aditya Singh, Lucknow, Uttar Pradesh, India<br>
          You received this because you signed up for Ratevo.
        </p>
      </div>
    </body>
    </html>
  `

  try {
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: subjectMap[type],
      html,
    })
    
    console.log('Trial reminder email sent', { to, type, emailId: result.data?.id })
    return { success: true, emailId: result.data?.id }
  } catch (err) {
    console.error('Failed to send trial reminder email:', { to, type, error: err.message })
    return { success: false, error: err.message }
  }
}

/**
 * Send payment receipt email
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.businessName - Business name
 * @param {string} params.planId - 'monthly' | 'yearly'
 * @param {number} params.amountPaise - Amount in paise
 * @param {string} params.orderId - Cashfree order ID
 * @param {string} params.paidAt - ISO date string
 */
export async function sendPaymentReceiptEmail({ to, businessName, planId, amountPaise, orderId, paidAt }) {
  const client = getResend()
  if (!client) {
    console.warn('Email not sent: Resend not configured', { to })
    return { success: false, reason: 'Resend not configured' }
  }

  const planName = planId === 'yearly' ? 'Yearly' : 'Monthly'
  const amount = `₹${(amountPaise / 100).toFixed(0)}`
  const paidDate = new Date(paidAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #000; border-radius: 12px; padding: 32px; color: #fff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Ratevo</h1>
          <p style="margin: 8px 0 0; color: #888; font-size: 14px;">by Xoiex</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;">
        
        <p style="font-size: 16px; margin: 0 0 16px;">Hi there,</p>
        
        <p style="font-size: 16px; margin: 0 0 24px;">Thank you for your payment! Your <strong>${planName}</strong> plan for <strong>${businessName}</strong> is now active.</p>
        
        <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888;">Plan</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Amount Paid</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">${amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Order ID</td>
              <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 14px;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Date</td>
              <td style="padding: 8px 0; text-align: right;">${paidDate}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: #888; margin: 24px 0 0;">
          You can view your billing history and download receipts from the 
          <a href="${CLIENT_URL}/dashboard/settings" style="color: #fff; text-decoration: underline;">Billing page</a>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;">
        
        <p style="font-size: 12px; color: #666; margin: 0; text-align: center;">
          Ratevo by Xoiex • Aditya Singh, Lucknow, Uttar Pradesh, India<br>
          This is an automated receipt for your payment.
        </p>
      </div>
    </body>
    </html>
  `

  try {
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Your Ratevo receipt — ${planName} plan (${amount})`,
      html,
    })
    
    console.log('Payment receipt email sent', { to, orderId, emailId: result.data?.id })
    return { success: true, emailId: result.data?.id }
  } catch (err) {
    console.error('Failed to send payment receipt email:', { to, orderId, error: err.message })
    return { success: false, error: err.message }
  }
}