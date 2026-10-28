import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { businessApi, billingApi } from '../services/api'
import { Button } from '../components'
import { formatDate } from '../utils/helpers'
import { getWhatsAppUrl } from '../config/business'
import { BILLING_CONFIG } from '../config/billing'

export default function BusinessSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')

  const billingEnabled = import.meta.env.VITE_BILLING_UI_ENABLED !== 'false'
  const paymentsProvider = import.meta.env.VITE_PAYMENTS_PROVIDER || 'manual'

  const tabs = [
    { id: 'account', label: 'Account', icon: UserIcon },
    { id: 'security', label: 'Security', icon: ShieldIcon },
    ...(billingEnabled ? [{ id: 'billing', label: 'Billing', icon: CreditCardIcon }] : []),
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-white">Settings</h1>
        <p className="text-[var(--text-muted)]">Manage your account and preferences</p>
      </div>

      <div className="card">
        <div className="border-b border-[var(--border)]">
          <nav className="flex -mb-px" aria-label="Settings tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-[var(--text-muted)] hover:text-white hover:border-[var(--border)]'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'account' && <AccountTab user={user} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'billing' && <BillingTab businessId={user?.businessId} billingEnabled={billingEnabled} paymentsProvider={paymentsProvider} />}
        </div>
      </div>
    </div>
  )
}

function AccountTab({ user }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: 'success', text: 'Profile updated successfully' })
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-md">
      {message && (
        <div className={`p-3 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-white/5 border border-white/10 text-white'
            : 'bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error)]'
        }`}>
        {message.text}
      </div>
      )}

      <div>
        <label htmlFor="email" className="label">Email</label>
        <input
          id="email"
          type="email"
          value={user?.email || ''}
          disabled
          className="input bg-white/5"
        />
        <p className="mt-1 text-sm text-[var(--text-subtle)]">Email cannot be changed</p>
      </div>

      <div>
        <label htmlFor="name" className="label">Display Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="Your name"
        />
      </div>

      <Button type="submit" variant="primary" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    setSaving(true)
    setMessage({ type: 'success', text: 'Password updated successfully' })
    setTimeout(() => {
      setSaving(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }, 1000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-md">
      {message && (
        <div className={`p-3 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-white/5 border border-white/10 text-white'
            : 'bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error)]'
        }`}>
        {message.text}
      </div>
      )}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="label">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="label">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              minLength={8}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={saving}>
        {saving ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  )
}

function BillingTab({ businessId: propBusinessId, billingEnabled, paymentsProvider }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [businessId, setBusinessId] = useState(propBusinessId)
  const [status, setStatus] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingOrder, setCreatingOrder] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadData()
  }, [businessId])

  const loadData = async () => {
    if (!businessId) return
    setLoading(true)
    try {
      const [statusRes, paymentsRes] = await Promise.all([
        billingApi.getStatus(businessId),
        billingApi.getPayments(businessId),
      ])
      setStatus(statusRes)
      setPayments(paymentsRes.payments || [])
    } catch (err) {
      console.error('Failed to load billing data:', err)
      setMessage({ type: 'error', text: 'Failed to load billing information' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async (planId) => {
    if (!businessId) return
    setCreatingOrder(planId)
    setMessage(null)
    try {
      const res = await billingApi.createOrder(businessId, planId)
      if (res.payment_session_id) {
        // Load Cashfree SDK and start checkout
        await loadCashfreeSDK()
        window.Cashfree.checkout({
          paymentSessionId: res.payment_session_id,
          mode: import.meta.env.VITE_CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
        })
      }
    } catch (err) {
      console.error('Create order failed:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to create payment order' })
    } finally {
      setCreatingOrder(null)
    }
  }

  const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.Cashfree) {
        resolve()
        return
      }
      const script = document.createElement('script')
      const isProd = import.meta.env.VITE_CASHFREE_ENV === 'production'
      script.src = isProd
        ? 'https://sdk.cashfree.com/js/v2/prod/sdk.js'
        : 'https://sdk.cashfree.com/js/v2/sdk.js'
      script.onload = resolve
      script.onerror = () => reject(new Error('Failed to load Cashfree SDK'))
      document.head.appendChild(script)
    })
  }

  const getStatusBadge = (subscriptionStatus) => {
    const configs = {
      active: { label: 'Active', className: 'bg-green-500/20 text-green-400' },
      trial: { label: 'Trial', className: 'bg-blue-500/20 text-blue-400' },
      grace: { label: 'Grace Period', className: 'bg-yellow-500/20 text-yellow-400' },
      expired: { label: 'Expired', className: 'bg-red-500/20 text-red-400' },
    }
    const cfg = configs[subscriptionStatus] || { label: subscriptionStatus, className: 'bg-white/10 text-white' }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
  }

  const getDaysLeftText = () => {
    if (!status) return null
    if (status.is_trial && status.trial_ends_at) {
      const days = Math.ceil((new Date(status.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
      return days > 0 ? `${days} day${days !== 1 ? 's' : ''} left in trial` : 'Trial ended'
    }
    if (status.is_active && status.days_left !== undefined) {
      return `${status.days_left} day${status.days_left !== 1 ? 's' : ''} remaining`
    }
    if (status.in_grace && status.days_left !== undefined) {
      return `${status.days_left} day${status.days_left !== 1 ? 's' : ''} in grace period`
    }
    if (status.is_expired) {
      return 'Subscription expired'
    }
    return null
  }

  const showPayButtons = billingEnabled && paymentsProvider === 'cashfree'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
      </div>
    )
  }

  if (!businessId) {
    return (
      <div className="text-center py-16">
        <svg className="mx-auto h-16 w-16 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-white">No business selected</h3>
        <p className="mt-2 text-[var(--text-muted)]">Create a business to manage billing</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-white/5 border border-white/10 text-white'
            : 'bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error)]'
        }`}>
        {message.text}
      </div>
      )}

      {/* Current Status */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[var(--text-muted)]">Status:</span>
              {status && getStatusBadge(status.subscription_status)}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[var(--text-muted)]">Plan:</span>
              <span className="font-medium text-white capitalize">{status?.subscription_plan || '—'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[var(--text-muted)]">Valid until:</span>
              <span className="font-medium text-white">
                {status?.paid_until ? new Date(status.paid_until).toLocaleDateString() : status?.trial_ends_at ? new Date(status.trial_ends_at).toLocaleDateString() + ' (trial ends)' : '—'}
              </span>
            </div>
            {status && getDaysLeftText() && (
              <p className="text-sm text-[var(--text-muted)]">{getDaysLeftText()}</p>
            )}
          </div>
          <div className="text-center md:text-left">
            <div className="text-3xl font-bold text-white mono">
              {status?.subscription_plan === 'yearly' ? '₹1,099' : status?.subscription_plan === 'monthly' ? '₹99' : '—'}
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              {status?.subscription_plan === 'yearly' ? '/year' : '/month'}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade / Pay Buttons */}
      {showPayButtons && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upgrade Plan</h3>
          <p className="text-[var(--text-muted)] mb-6">Choose a plan to continue or upgrade your subscription</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PlanButton
              planId="monthly"
              plan={BILLING_CONFIG.plans.monthly}
              isCurrent={status?.subscription_plan === 'monthly' && status?.is_active}
              onClick={handleCreateOrder}
              disabled={creatingOrder === 'monthly'}
            />
            <PlanButton
              planId="yearly"
              plan={BILLING_CONFIG.plans.yearly}
              isCurrent={status?.subscription_plan === 'yearly' && status?.is_active}
              onClick={handleCreateOrder}
              disabled={creatingOrder === 'yearly'}
            />
          </div>
        </div>
      )}

      {!showPayButtons && billingEnabled && (
        <div className="card p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-3">Online payments coming soon</h3>
          <p className="text-[var(--text-muted)] mb-6 max-w-xl mx-auto">
            To activate a plan now, message us on WhatsApp with the plan name and we&apos;ll set you up manually.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="lg" asChild>
              <a
                href={getWhatsAppUrl(`Hi, I'd like to activate the Monthly plan (₹99/month) for my business.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.182.284-.528.248-.696-.038-.173-.381-.675-.708-1.379-.329-.709-.537-1.148-.64-1.31-.103-.162-.24-.316-.368-.465a4.43 4.43 0 0 0-.516-.381 4.71 4.71 0 0 0-.573-.242c-.417-.096-1.132-.116-1.694.103-.56.218-1.07.578-1.465 1.134-.395.556-.717 1.376-.89 2.023-.173.645-.223 1.307-.196 1.93.027.633.262 1.477.865 2.18.603.703 1.542 2.017 2.955 3.194 1.21 1.006 2.122 1.69 2.68 2.13.558.44 1.328.754 2.236.827.622.05 1.161-.144 1.374-.461.18-.266.26-.594.26-.918 0-.297-.018-.525-.037-.61zM12 2C6.477 2 2 6.477 2 12c0 2.368.881 4.533 2.34 6.207l-.928 3.506 3.63-.96c1.675.924 3.567 1.768 5.46 1.768 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
                Activate Monthly (₹99/mo)
              </a>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a
                href={getWhatsAppUrl(`Hi, I'd like to activate the Yearly plan (₹1,099/year) for my business.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.182.284-.528.248-.696-.038-.173-.381-.675-.708-1.379-.329-.709-.537-1.148-.64-1.31-.103-.162-.24-.316-.368-.465a4.43 4.43 0 0 0-.516-.381 4.71 4.71 0 0 0-.573-.242c-.417-.096-1.132-.116-1.694.103-.56.218-1.07.578-1.465 1.134-.395.556-.717 1.376-.89 2.023-.173.645-.223 1.307-.196 1.93.027.633.262 1.477.865 2.18.603.703 1.542 2.017 2.955 3.194 1.21 1.006 2.122 1.69 2.68 2.13.558.44 1.328.754 2.236.827.622.05 1.161-.144 1.374-.461.18-.266.26-.594.26-.918 0-.297-.018-.525-.037-.61zM12 2C6.477 2 2 6.477 2 12c0 2.368.881 4.533 2.34 6.207l-.928 3.506 3.63-.96c1.675.924 3.567 1.768 5.46 1.768 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
                Activate Yearly (₹1,099/yr)
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="card">
        <div className="p-6 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-white">Payment History</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {payments.length === 0 ? (
            <div className="p-6 text-center text-[var(--text-muted)]">No payments yet</div>
          ) : (
            payments.map((payment) => (
              <PaymentHistoryItem key={payment.id} payment={payment} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function PlanButton({ planId, plan, isCurrent, onClick, disabled }) {
  const isYearly = planId === 'yearly'

  return (
    <button
      type="button"
      onClick={() => onClick(planId)}
      disabled={disabled || isCurrent}
      className={`relative p-6 rounded-xl border-2 text-left transition-all ${
        isCurrent
          ? 'border-green-500 bg-green-500/10 cursor-default'
          : disabled
          ? 'border-[var(--border)] bg-white/5 cursor-wait opacity-75'
          : 'border-[var(--border)] hover:border-white/50 hover:bg-white/5 cursor-pointer'
      }`}
    >
      {plan.label && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-white text-black text-xs font-semibold px-3 py-1 rounded-full">
            {plan.label}
          </span>
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-3 right-3">
          <span className="bg-green-500 text-black text-xs font-semibold px-3 py-1 rounded-full">Current</span>
        </div>
      )}
      <div className="text-center mb-4">
        <h4 className="font-semibold text-white">{plan.name}</h4>
        <div className="mt-2 flex items-baseline justify-center gap-1">
          <span className="text-2xl font-bold text-white mono">{plan.amountDisplay}</span>
          <span className="text-[var(--text-muted)] self-end pb-1">{isYearly ? '/year' : '/month'}</span>
        </div>
        {plan.regularPriceDisplay && (
          <p className="mt-1 text-sm text-[var(--text-subtle)] line-through">
            Regular: ₹{plan.regularPriceDisplay}{isYearly ? '/year' : '/month'}
        </p>
        )}
        {isYearly && (
          <p className="mt-1 text-sm text-white">Billed yearly: ₹{plan.amountDisplay}</p>
        )}
      </div>
      <Button
        variant={isYearly ? 'primary' : 'secondary'}
        width="full"
        disabled={disabled || isCurrent}
      >
        {disabled ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : isCurrent ? (
          'Current Plan'
        ) : (
          `Pay ₹${plan.amountDisplay}${isYearly ? '/year' : '/month'}`
        )}
      </Button>
    </button>
  )
}

function PaymentHistoryItem({ payment }) {
  const statusColors = {
    paid: 'text-green-400',
    pending: 'text-yellow-400',
    failed: 'text-red-400',
    refunded: 'text-[var(--text-muted)]',
  }
  const statusLabels = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
    refunded: 'Refunded',
  }

  return (
    <div className="p-4 hover:bg-white/5 transition-colors duration-fast">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/5 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white capitalize">{payment.plan_id}</p>
            <p className="text-sm text-[var(--text-muted)]">
              ₹{(payment.amount_paise / 100).toFixed(0)} • {formatDate(payment.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium ${statusColors[payment.status] || 'text-white'}`}>
            {statusLabels[payment.status] || payment.status}
          </span>
          {payment.payment_method_label && (
            <span className="text-xs text-[var(--text-subtle)] px-2 py-1 bg-white/5 rounded">
              {payment.payment_method_label}
            </span>
          )}
          {payment.paid_at && (
            <span className="text-xs text-[var(--text-subtle)]">
              Paid {formatDate(payment.paid_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function UserIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}
function ShieldIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}
function CreditCardIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
}