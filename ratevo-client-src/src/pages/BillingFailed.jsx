import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '../components'
import { api } from '../services/api'

export default function BillingFailed() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const errorCode = searchParams.get('error_code')
  const errorMessage = searchParams.get('error_message')
  const navigate = useNavigate()

  const [paymentStatus, setPaymentStatus] = useState('checking')
  const [details, setDetails] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setPaymentStatus('unknown')
      return
    }
    checkPaymentStatus()
  }, [orderId])

  const checkPaymentStatus = async () => {
    try {
      const data = await api.get(`/billing/status?order_id=${orderId}`)
      setDetails(data)
      if (data.subscription_status === 'active' || data.subscription_status === 'trial') {
        setPaymentStatus('paid')
      } else {
        setPaymentStatus('failed')
      }
    } catch (err) {
      setPaymentStatus('failed')
    }
  }

  const getErrorMessage = () => {
    if (errorMessage) return decodeURIComponent(errorMessage)
    if (errorCode) return `Error: ${errorCode}`
    return 'The payment could not be completed. This may be due to insufficient funds, bank decline, or a technical issue.'
  }

  const handleRetry = () => {
    if (orderId) {
      navigate(`/dashboard/billing?retry=${orderId}`)
    } else {
      navigate('/dashboard/billing')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="card p-8 max-w-md w-full text-center">
        {paymentStatus === 'checking' ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto"></div>
            <h2 className="mt-4 text-xl font-bold text-white">Checking payment status...</h2>
            <p className="mt-2 text-[var(--text-muted)]">Please wait</p>
          </>
        ) : paymentStatus === 'paid' ? (
          <>
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">Payment Successful!</h2>
            <p className="mt-2 text-[var(--text-muted)]">Your payment was processed successfully.</p>
            <Button variant="primary" width="full" asChild className="mt-6">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </>
        ) : (
          <>
            <svg className="mx-auto h-16 w-16 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-white">Payment Failed</h2>
            <p className="mt-2 text-[var(--text-muted)]">{getErrorMessage()}</p>

            {details && (
              <div className="mt-6 p-4 bg-white/5 rounded-xl text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Current status</span>
                  <span className={`font-medium ${details.subscription_status === 'active' ? 'text-green-400' : details.subscription_status === 'grace' ? 'text-yellow-400' : 'text-[var(--error)]'}`}>
                    {details.subscription_status}
                  </span>
                </div>
                {details.paid_until && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Access until</span>
                    <span className="font-medium text-white">{new Date(details.paid_until).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button variant="primary" width="full" onClick={handleRetry}>
                Try Again
              </Button>
              <Button variant="secondary" width="full" asChild>
                <Link to="/dashboard/billing">View Billing</Link>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3 text-sm text-[var(--text-muted)]">
              <p>Common reasons for failure:</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Insufficient funds or daily UPI limit reached</li>
                <li>Bank declined the transaction</li>
                <li>Network timeout during payment</li>
                <li>Incorrect card/UPI details</li>
              </ul>
              <p className="mt-4">
                If you were charged but see this page, the payment may still be processing. 
                Check your bank statement and <Link to="/contact" className="underline hover:text-white">contact support</Link> if needed.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}