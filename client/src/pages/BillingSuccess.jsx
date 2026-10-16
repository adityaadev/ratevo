import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button, Logo } from '../components'
import { api } from '../services/api'
import { BillingStatusSkeleton } from '../components'

export default function BillingSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const navigate = useNavigate()
  
  const [verified, setVerified] = useState(false)
  const [failed, setFailed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [details, setDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setChecking(false)
      setFailed(true)
      setError('No order ID provided')
      return
    }
    verifyPayment()
  }, [orderId])

  const verifyPayment = async () => {
    let attempts = 0
    const maxAttempts = 10
    const interval = 3000

    const check = async () => {
      try {
        const data = await api.get(`/billing/status?order_id=${orderId}`)
        if (data.subscription_status === 'active' || data.subscription_status === 'trial') {
          setVerified(true)
          setDetails(data)
          setChecking(false)
          return
        }
        
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(check, interval)
        } else {
          setFailed(true)
          setChecking(false)
          setError('Payment verification timed out. Please check your billing page or contact support.')
        }
      } catch (err) {
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(check, interval)
        } else {
          setFailed(true)
          setChecking(false)
          setError(err.message || 'Failed to verify payment')
        }
      }
    }

    check()
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto"></div>
          <h2 className="mt-4 text-xl font-bold text-white">Verifying your payment...</h2>
          <p className="mt-2 text-[var(--text-muted)]">This may take a few moments</p>
          <BillingStatusSkeleton className="mt-8" />
        </div>
      </div>
    )
  }

  if (failed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <svg className="mx-auto h-16 w-16 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-white">Verification Failed</h2>
          <p className="mt-2 text-[var(--text-muted)]">{error}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" width="full" asChild>
              <Link to="/dashboard/billing">Go to Billing</Link>
            </Button>
            <Button variant="primary" width="full" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="card p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold text-white">Payment Successful!</h2>
          <p className="mt-2 text-[var(--text-muted)]">Your subscription is now active</p>

          {details && (
            <div className="mt-8 p-4 bg-white/5 rounded-xl text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Plan</span>
                <span className="font-medium text-white capitalize">{details.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Status</span>
                <span className="font-medium text-green-400 capitalize">{details.subscription_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Valid until</span>
                <span className="font-medium text-white">{details.paid_until ? new Date(details.paid_until).toLocaleDateString() : 'Trial'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Order ID</span>
                <span className="font-mono text-xs text-white">{orderId}</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button variant="primary" width="full" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="secondary" width="full" asChild>
              <Link to="/dashboard/billing">View Billing</Link>
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-[var(--text-subtle)]">
            A receipt has been sent to your email. You can also download it from the billing page.
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--text-subtle)] flex items-center justify-center gap-1.5">
          Powered by <Logo size="sm" standalone /> by Xoiex
        </p>
      </div>
    </div>
  )
}