import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { businessApi, reviewApi } from '../services/api'
import { trackEvent } from '../utils/analytics'
import { getReviewGenerationErrorMessage } from '../utils/helpers'
import { Button, Logo } from '../components'

export default function ReviewResultPage() {
  const { businessSlug } = useParams()
  const navigate = useNavigate()
  
  const [business, setBusiness] = useState(null)
  const [generatedReview, setGeneratedReview] = useState('')
  const [editedReview, setEditedReview] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [submittedData, setSubmittedData] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')
  const [generationError, setGenerationError] = useState(null)

  useEffect(() => {
    loadSession()
  }, [businessSlug])

  const loadSession = async () => {
    try {
      const params = new URLSearchParams(window.location.search)
      const sessionIdFromUrl = params.get('session')
      
      if (!sessionIdFromUrl) {
        throw new Error('No review session found')
      }
      
      setSessionId(sessionIdFromUrl)
      
      const biz = await businessApi.getPublic(businessSlug)
      setBusiness(biz)
      
      const session = await reviewApi.getSession(sessionIdFromUrl)
      setGeneratedReview(session.generated_review)
      setEditedReview(session.generated_review)
      setSubmittedData({
        rating: session.rating,
        selected_feedback: session.feedback_data,
        customer_text: session.customer_text,
      })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!sessionId || !submittedData) return
    setGenerating(true)
    setGenerationError(null)
    try {
      const data = await reviewApi.generate(sessionId, submittedData)
      setGeneratedReview(data.generated_review)
      setEditedReview(data.generated_review)
      trackEvent('review_generated', { businessSlug, business_id: business?.id, sessionId, regenerated: true })
    } catch (err) {
      setGenerationError(getReviewGenerationErrorMessage(err.status))
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (text) => {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (e) {
        console.warn('Clipboard API failed, falling back:', e)
      }
    }
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      textarea.setSelectionRange(0, text.length)
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    } catch (e) {
      console.error('Fallback copy failed:', e)
      return false
    }
  }

  const buildGoogleReviewUrl = () => {
    if (business?.google_review_url) {
      return business.google_review_url
    }
    return null
  }

  const handleGoogleClick = () => {
    const url = buildGoogleReviewUrl()
    if (!url) {
      setCopyMessage('No Google review link configured for this business.')
      return
    }

    const textToCopy = editedReview.trim()
    if (!textToCopy) {
      setCopyMessage('No review text to copy.')
      return
    }

    const copyPromise = copyToClipboard(textToCopy)
    window.open(url, '_blank', 'noopener,noreferrer')

    copyPromise.then(success => {
      if (success) {
        setCopied(true)
        setCopyMessage('Review copied! Paste it in the Google box and press Submit.')
      } else {
        setCopyMessage('Failed to copy review. Please copy manually.')
      }
    })

    try {
      trackEvent('google_review_clicked', { businessSlug, business_id: business?.id, sessionId })
    } catch (e) {
      console.warn('Analytics tracking failed:', e)
    }
  }

  const handleCopyAgain = () => {
    const textToCopy = editedReview.trim()
    if (!textToCopy) {
      setCopyMessage('No review text to copy.')
      return
    }

    copyToClipboard(textToCopy).then(success => {
      if (success) {
        setCopyMessage('Review copied again! Paste it in the Google box and press Submit.')
      } else {
        setCopyMessage('Failed to copy review. Please copy manually.')
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
      </div>
    )
  }

  if (error || !business) {
    const notFound = error?.status === 404
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <svg className="mx-auto h-16 w-16 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-white">{notFound ? 'Review Not Found' : 'Unable to Load Review'}</h2>
          <p className="mt-2 text-[var(--text-muted)]">{notFound ? 'This review session has expired or doesn\'t exist.' : error?.message || 'The review could not be loaded.'}</p>
          <Button variant="primary" size="lg" asChild className="mt-6">
            <a href={`/r/${businessSlug}`}>Start New Review</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="card overflow-hidden">
          <div className="bg-white/5 px-6 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                <BuildingIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-white">{business.name}</h1>
                <p className="text-sm text-[var(--text-muted)]">{business.category}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-heading-sm font-bold text-white">Your Review</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Review and edit before posting to Google</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 min-h-[120px]">
              <textarea
                value={editedReview}
                onChange={(e) => setEditedReview(e.target.value)}
                rows={5}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-white"
                placeholder="Your generated review will appear here..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRegenerate}
                variant="secondary"
                width="full"
                disabled={generating}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {generating ? 'Regenerating...' : generationError ? 'Try again' : 'Regenerate'}
              </Button>
              
              <Button
                onClick={copied ? handleCopyAgain : handleGoogleClick}
                variant={business?.google_review_url ? 'primary' : 'secondary'}
                width="full"
                disabled={!business?.google_review_url}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.327,0-6.033-2.691-6.033-6.033s2.706-6.033,6.033-6.033c1.498,0,2.866,0.539,3.921,1.453l2.814-2.814C17.533,1.817,15.387,1,12.545,1C7.371,1,3.271,5.1,3.271,10.272c0,2.346,0.84,4.477,2.263,6.081l3.008,3.008l0.939,0.939c1.339-0.793,2.47-1.997,3.132-3.508l-2.191-2.191l-0.938-0.939C9.187,10.779,8.668,10.504,8.144,10.239H12.545z"/>
                </svg>
                {copied ? 'Copy Again' : 'Copy & Open Google Review'}
              </Button>
            </div>

            {generationError && <p role="alert" className="text-sm text-[var(--error)]">{generationError}</p>}

            {copyMessage && (
              <p className="text-center text-sm text-[var(--text-muted)] bg-white/5 px-4 py-2 rounded-xl">
                {copyMessage}
              </p>
            )}

            <p className="text-center text-xs text-[var(--text-subtle)]">
              Ratevo never posts automatically. You control the final review on Google.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--text-subtle)] flex items-center justify-center gap-1.5">
          Powered by <Logo size="sm" standalone /> by Xoiex
        </p>
      </div>
    </div>
  )
}

function BuildingIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
}