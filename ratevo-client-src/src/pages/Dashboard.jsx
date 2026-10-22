import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { businessApi, analyticsApi, billingApi } from '../services/api'
import { formatDate, cn } from '../utils/helpers'
import { Button } from '../components'

export default function Dashboard() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [billing, setBilling] = useState(null)
  const [stats, setStats] = useState({
    totalScans: 0,
    totalRatings: 0,
    totalGenerated: 0,
    totalClicks: 0,
    avgRating: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [billingLoading, setBillingLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const businesses = await businessApi.getAll()
      if (businesses.length > 0) {
        const firstBusiness = businesses[0]
        setBusiness(firstBusiness)
        const analytics = await analyticsApi.get(firstBusiness.id)
        setStats(analytics.stats || stats)
        setRecentActivity(analytics.recentActivity || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadBilling = async () => {
    if (!business) return
    try {
      setBillingLoading(true)
      const billingData = await billingApi.getStatus(business.id)
      setBilling(billingData)
    } catch (err) {
      console.error('Failed to load billing:', err)
    } finally {
      setBillingLoading(false)
    }
  }

  useEffect(() => {
    loadBilling()
  }, [business])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent"></div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="mt-4 text-heading-md font-semibold text-white">No business yet</h2>
          <p className="mt-2 text-[var(--text-muted)]">Create your first business to start collecting reviews</p>
          <Button variant="primary" size="lg" asChild className="mt-6">
            <Link to="/dashboard/business">Create Business</Link>
          </Button>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'QR Scans', value: stats.totalScans, icon: QrCodeIcon },
    { label: 'Ratings Submitted', value: stats.totalRatings, icon: StarIcon },
    { label: 'Reviews Generated', value: stats.totalGenerated, icon: DocumentIcon },
    { label: 'Google Clicks', value: stats.totalClicks, icon: ArrowIcon },
    { label: 'Avg Rating', value: stats.avgRating ? stats.avgRating.toFixed(1) : '—', icon: ChartIcon },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-white">Dashboard</h1>
        <p className="text-[var(--text-muted)]">Welcome back, {user?.email?.split('@')[0]}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Billing Status Card */}
      <div className="mb-8">
        <BillingStatusCard billing={billing} loading={billingLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <Link to="/dashboard/analytics" className="text-sm text-white hover:opacity-70">View all</Link>
            </div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-[var(--text-muted)]">No recent activity</div>
            ) : (
              recentActivity.slice(0, 10).map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <Button variant="secondary" width="full" asChild>
              <Link to="/dashboard/qr" className="flex items-center justify-start gap-3 w-full">
                <QrCodeIcon className="w-5 h-5" />
                <span>View & Download QR Code</span>
              </Link>
            </Button>
            <Button variant="secondary" width="full" asChild>
              <Link to="/dashboard/business" className="flex items-center justify-start gap-3 w-full">
                <BuildingIcon className="w-5 h-5" />
                <span>Edit Business Details</span>
              </Link>
            </Button>
            <Button variant="secondary" width="full" asChild>
              <Link to="/dashboard/analytics" className="flex items-center justify-start gap-3 w-full">
                <ChartIcon className="w-5 h-5" />
                <span>View Full Analytics</span>
              </Link>
            </Button>
            <Button variant="secondary" width="full" asChild>
              <Link to="/dashboard/settings" className="flex items-center justify-start gap-3 w-full">
                <SettingsIcon className="w-5 h-5" />
                <span>Account Settings</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white mono">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity }) {
  const icons = {
    qr_scan: QrCodeIcon,
    rating_submitted: StarIcon,
    review_generated: DocumentIcon,
    google_review_clicked: ArrowIcon,
  }
  const Icon = icons[activity.event_type] || DocumentIcon
  
  const labels = {
    qr_scan: 'QR code scanned',
    rating_submitted: `Rated ${activity.rating} stars`,
    review_generated: 'Review generated',
    google_review_clicked: 'Clicked "Review on Google"',
  }

  return (
    <div className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors duration-fast">
      <div className="p-2 bg-white/5 rounded-lg text-white">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{labels[activity.event_type] || activity.event_type}</p>
        <p className="text-xs text-[var(--text-subtle)] mono">{formatDate(activity.created_at)}</p>
      </div>
      {activity.rating && (
        <span className="text-sm font-medium text-white mono">{activity.rating}★</span>
      )}
    </div>
  )
}

function QrCodeIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
}
function StarIcon({ className }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
}
function DocumentIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
}
function ArrowIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
}
function ChartIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
}
function BuildingIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
}
function SettingsIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
237: }

function BillingStatusCard({ billing, loading }) {
  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!billing) {
    return (
      <div className="card p-6 text-center">
        <p className="text-[var(--text-muted)]">Unable to load billing information</p>
      </div>
    )
  }

  const getTimeRemaining = (endDate) => {
    if (!endDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return { days, hours, minutes, seconds, expired: false }
  }

  const trialEndsAt = billing.trial_ends_at
  const paidUntil = billing.paid_until
  const isTrial = billing.is_trial
  const isActive = billing.is_active
  const isExpired = billing.is_expired
  const inGrace = billing.in_grace

  let statusText = ''
  let statusColor = 'text-white'
  let timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  let expiryDate = null
  let startDate = null
  let planName = billing.subscription_plan ? billing.subscription_plan.charAt(0).toUpperCase() + billing.subscription_plan.slice(1) : 'Trial'

  if (isTrial && trialEndsAt) {
    statusText = 'Free Trial'
    statusColor = 'text-blue-400'
    timeRemaining = getTimeRemaining(trialEndsAt)
    startDate = new Date(new Date(trialEndsAt).getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (isActive && paidUntil) {
    statusText = `${planName} Plan`
    statusColor = 'text-green-400'
    timeRemaining = getTimeRemaining(paidUntil)
    expiryDate = paidUntil
  } else if (inGrace && paidUntil) {
    statusText = `${planName} Plan (Grace Period)`
    statusColor = 'text-yellow-400'
    timeRemaining = getTimeRemaining(paidUntil)
    expiryDate = paidUntil
  } else if (isExpired) {
    statusText = 'Expired'
    statusColor = 'text-red-400'
    timeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    expiryDate = paidUntil || trialEndsAt
  } else {
    statusText = 'Unknown'
    statusColor = 'text-[var(--text-muted)]'
  }

  const CardIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Subscription Status</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor} bg-opacity-20`}>
          {statusText}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-xl">
          <p className="text-sm text-[var(--text-muted)] mb-1">Plan</p>
          <p className="font-medium text-white">{planName}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl">
          <p className="text-sm text-[var(--text-muted)] mb-1">Status</p>
          <p className={`font-medium ${statusColor}`}>{statusText}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl sm:col-span-2">
          <p className="text-sm text-[var(--text-muted)] mb-1">Started</p>
          <p className="font-medium text-white">{startDate ? new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl sm:col-span-2">
          <p className="text-sm text-[var(--text-muted)] mb-1">Expires</p>
          <p className="font-medium text-white">{expiryDate ? new Date(expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
        </div>
      </div>

      {timeRemaining.expired ? (
        <div className="bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl p-4 text-center">
          <p className="text-[var(--error)] font-medium">Subscription expired</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Upgrade to continue using Ratevo</p>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-sm text-[var(--text-muted)] mb-3">Time Remaining</p>
          <div className="flex items-center justify-center gap-2">
            <div className="bg-white/5 px-3 py-2 rounded-xl text-center min-w-[60px]">
              <p className="text-2xl font-bold text-white mono">{timeRemaining.days}</p>
              <p className="text-xs text-[var(--text-muted)]">Days</p>
            </div>
            <div className="bg-white/5 px-3 py-2 rounded-xl text-center min-w-[60px]">
              <p className="text-2xl font-bold text-white mono">{timeRemaining.hours}</p>
              <p className="text-xs text-[var(--text-muted)]">Hours</p>
            </div>
            <div className="bg-white/5 px-3 py-2 rounded-xl text-center min-w-[60px]">
              <p className="text-2xl font-bold text-white mono">{timeRemaining.minutes}</p>
              <p className="text-xs text-[var(--text-muted)]">Mins</p>
            </div>
            <div className="bg-white/5 px-3 py-2 rounded-xl text-center min-w-[60px]">
              <p className="text-2xl font-bold text-white mono">{timeRemaining.seconds}</p>
              <p className="text-xs text-[var(--text-muted)]">Secs</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-[var(--border)]">
        <a href="/dashboard/settings" className="inline-flex items-center gap-2 text-sm font-medium text-white hover:opacity-70 transition-opacity">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage Subscription
        </a>
      </div>
    </div>
  )
}

function getTimeRemaining(endDate) {
  if (!endDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, expired: false }
}

function SettingsIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}