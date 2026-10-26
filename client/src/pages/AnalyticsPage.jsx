import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { analyticsApi, businessApi } from '../services/api'
import { formatDate, cn } from '../utils/helpers'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const businesses = await businessApi.getAll()
      if (businesses.length > 0) {
        const biz = businesses[0]
        setBusiness(biz)
        const data = await analyticsApi.get(biz.id)
        setAnalytics(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="mt-4 text-heading-md font-semibold text-white">No business found</h2>
        </div>
      </div>
    )
  }

  const stats = analytics?.stats || {
    totalScans: 0,
    totalRatings: 0,
    totalGenerated: 0,
    totalClicks: 0,
    avgRating: 0,
  }

  const conversionRate = stats.totalScans > 0 
    ? ((stats.totalClicks / stats.totalScans) * 100).toFixed(1) 
    : 0

  const ratingDistribution = analytics?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const maxRatingCount = Math.max(...Object.values(ratingDistribution), 1)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-white">Analytics</h1>
        <p className="text-[var(--text-muted)]">{business.name} — Overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="QR Scans" value={stats.totalScans} icon={QrCodeIcon} />
        <StatCard label="Ratings" value={stats.totalRatings} icon={StarIcon} />
        <StatCard label="Generated" value={stats.totalGenerated} icon={DocumentIcon} />
        <StatCard label="Google Clicks" value={stats.totalClicks} icon={ArrowIcon} />
        <StatCard label="Conversion" value={`${conversionRate}%`} icon={PercentIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-white">Average Rating</h2>
          </div>
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-5xl font-bold text-white mono">
                {stats.avgRating ? stats.avgRating.toFixed(1) : '—'}
              </span>
              <span className="text-[var(--text-subtle)] self-end">/ 5.0</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              {[1,2,3,4,5].map((star) => (
                <svg
                  key={star}
                  className={cn(
                    'w-6 h-6',
                    stats.avgRating && star <= Math.round(stats.avgRating) 
                      ? 'text-white fill-current' 
                      : 'text-[var(--text-subtle)]'
                  )}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Based on {stats.totalRatings} rating{stats.totalRatings !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-white">Rating Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[5,4,3,2,1].map((star) => {
                const count = ratingDistribution[star] || 0
                const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-8 text-right text-sm font-medium text-[var(--text-muted)] mono">
                      {star}★
                    </span>
                    <div className="flex-1 min-w-0 h-4 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-white/20"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-sm text-[var(--text-subtle)] mono truncate">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Events</h2>
          </div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {(analytics?.recentActivity || []).length === 0 ? (
            <div className="p-6 text-center text-[var(--text-muted)]">No events recorded yet</div>
          ) : (
            (analytics?.recentActivity || []).slice(0, 20).map((event, index) => (
              <EventRow key={index} event={event} />
            ))
          )}
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

function EventRow({ event }) {
  const icons = {
    qr_scan: QrCodeIcon,
    rating_submitted: StarIcon,
    review_generated: DocumentIcon,
    google_review_clicked: ArrowIcon,
  }
  const Icon = icons[event.event_type] || DocumentIcon
  
  const labels = {
    qr_scan: 'QR code scanned',
    rating_submitted: `Rated ${event.rating} stars`,
    review_generated: 'Review generated',
    google_review_clicked: 'Clicked "Review on Google"',
  }

  return (
    <div className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors duration-fast">
      <div className="p-2 bg-white/5 rounded-lg text-white">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{labels[event.event_type] || event.event_type}</p>
        <p className="text-xs text-[var(--text-subtle)] mono">{formatDate(event.created_at)}</p>
      </div>
      {event.rating && (
        <span className="text-sm font-medium text-white mono">{event.rating}★</span>
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
function PercentIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
}