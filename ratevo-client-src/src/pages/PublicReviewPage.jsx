import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reviewApi, businessApi } from '../services/api'
import { trackEvent } from '../utils/analytics'
import { getReviewGenerationErrorMessage } from '../utils/helpers'
import { Button, Logo } from '../components'

const FEEDBACK_OPTIONS = [
  { id: 'helpful_staff', label: 'Helpful staff', icon: UsersIcon },
  { id: 'good_service', label: 'Good service', icon: CheckIcon },
  { id: 'clean_environment', label: 'Clean environment', icon: SparklesIcon },
  { id: 'friendly_staff', label: 'Friendly staff', icon: HeartIcon },
  { id: 'fast_service', label: 'Fast service', icon: BoltIcon },
  { id: 'clear_communication', label: 'Clear communication', icon: ChatIcon },
  { id: 'good_experience', label: 'Good experience', icon: StarIcon },
  { id: 'long_wait', label: 'Long waiting time', icon: ClockIcon },
  { id: 'poor_communication', label: 'Poor communication', icon: XCircleIcon },
  { id: 'unclean', label: 'Unclean', icon: TrashIcon },
  { id: 'rude_staff', label: 'Rude staff', icon: FrownIcon },
  { id: 'expensive', label: 'Too expensive', icon: DollarIcon },
]

export default function PublicReviewPage() {
  const { businessSlug } = useParams()
  const navigate = useNavigate()
  
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [step, setStep] = useState('rating')
  const [rating, setRating] = useState(0)
  const [selectedFeedback, setSelectedFeedback] = useState([])
  const [customerText, setCustomerText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    loadBusiness()
  }, [businessSlug])

  const loadBusiness = async () => {
    try {
      const data = await businessApi.getPublic(businessSlug)
      setBusiness(data)
      trackEvent('qr_scan', { businessSlug, business_id: data.id })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingSelect = (stars) => {
    setRating(stars)
    setStep('feedback')
    trackEvent('rating_submitted', { businessSlug, business_id: business?.id, rating: stars })
  }

  const toggleFeedback = (id) => {
    setSelectedFeedback(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    )
  }

  const createSession = async (e) => {
    e.preventDefault()
    if (sessionId) {
      setStep('text')
      return
    }
    setSubmitting(true)
    setActionError(null)
    try {
      const data = await reviewApi.start(businessSlug, {
        rating,
        selected_feedback: selectedFeedback,
        customer_text: customerText,
      })
      setSessionId(data.session_id)
      setStep('text')
      trackEvent('feedback_submitted', { businessSlug, business_id: business?.id, sessionId: data.session_id })
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerateReview = async () => {
    if (!sessionId) return
    setSubmitting(true)
    setStep('generating')
    setActionError(null)
    try {
      const data = await reviewApi.generate(sessionId, {
        rating,
        selected_feedback: selectedFeedback,
        customer_text: customerText,
      })
      trackEvent('review_generated', { businessSlug, business_id: business?.id, sessionId })
      navigate(`/r/${businessSlug}/result?session=${sessionId}`)
    } catch (err) {
      setActionError(getReviewGenerationErrorMessage(err.status))
      setStep('text')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent"></div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <svg className="mx-auto h-16 w-16 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-white">Business Not Found</h2>
          <p className="mt-2 text-[var(--text-muted)]">This review link appears to be invalid or the business no longer exists.</p>
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

          <div className="p-6">
            {step === 'rating' && <RatingStep 
              rating={rating} 
              onSelect={handleRatingSelect}
              businessName={business.name}
            />}
            
            {step === 'feedback' && <FeedbackStep
              selectedFeedback={selectedFeedback}
              onToggle={toggleFeedback}
              onSubmit={createSession}
              onSkip={createSession}
              submitting={submitting}
            />}
            
            {step === 'text' && <TextStep
              customerText={customerText}
              onChange={setCustomerText}
              onBack={() => setStep('feedback')}
              onGenerate={handleGenerateReview}
              generating={submitting}
              sessionId={sessionId}
              error={actionError}
            />}
            
            {step === 'generating' && <GeneratingStep />}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--text-subtle)] flex items-center justify-center gap-1.5">
          Powered by <Logo size="sm" standalone /> by Xoiex
        </p>
      </div>
    </div>
  )
}

function RatingStep({ rating, onSelect, businessName }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-heading-md font-bold text-white">How was your experience?</h2>
        <p className="mt-2 text-[var(--text-muted)]">Rate {businessName}</p>
      </div>
      
      <div className="flex items-center justify-center gap-3" role="radiogroup" aria-label="Star rating">
        {[1,2,3,4,5].map((star) => (
          <button
            key={star}
            onClick={() => onSelect(star)}
            className={`p-2 rounded-lg transition-all ${
              star <= rating 
                ? 'text-white bg-white/10' 
                : 'text-[var(--text-subtle)] hover:text-white hover:bg-white/5'
            }`}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            aria-checked={star <= rating}
          >
            <svg className="w-12 h-12" fill={star <= rating ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

function FeedbackStep({ selectedFeedback, onToggle, onSubmit, onSkip, submitting }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-heading-md font-bold text-white">What did you like?</h2>
        <p className="mt-2 text-[var(--text-muted)]">Select all that apply (optional)</p>
      </div>

      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Feedback options">
        {FEEDBACK_OPTIONS.slice(0, 7).map((option) => (
          <FeedbackOption
            key={option.id}
            option={option}
            selected={selectedFeedback.includes(option.id)}
            onToggle={onToggle}
          />
        ))}
      </div>

      <div className="pt-4 border-t border-[var(--border)]">
        <Button
          type="button"
          variant="secondary"
          width="full"
          onClick={onSkip}
          disabled={submitting}
        >
          Skip & Write Review
        </Button>
        <Button
          type="submit"
          variant="primary"
          width="full"
          className="mt-3"
          disabled={submitting}
        >
          {submitting ? 'Generating...' : 'Continue'}
        </Button>
      </div>
    </form>
  )
}

function FeedbackOption({ option, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.id)}
      className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
        selected
          ? 'border-white bg-white/5'
          : 'border-[var(--border)] hover:border-white/50 hover:bg-white/5'
      }`}
      role="checkbox"
      aria-checked={selected}
    >
      <div className={`p-2 rounded-lg ${selected ? 'bg-white/10 text-white' : 'bg-white/5 text-[var(--text-subtle)]'}`}>
        <option.icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-white">{option.label}</span>
      {selected && (
        <svg className="ml-auto w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  )
}

function TextStep({ customerText, onChange, onBack, onGenerate, generating, sessionId, error }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-heading-md font-bold text-white">Anything else to add?</h2>
        <p className="mt-2 text-[var(--text-muted)]">Your own words help make the review more authentic (optional)</p>
      </div>

      <textarea
        value={customerText}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="input"
        placeholder="The doctor explained everything properly and the staff was very patient..."
        maxLength={500}
      />

      {error && <p role="alert" className="text-sm text-[var(--error)]">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onBack}
          type="button"
          variant="secondary"
          width="full"
          disabled={generating}
        >
          Back
        </Button>
        <Button
          onClick={onGenerate}
          variant="primary"
          width="full"
          disabled={generating}
        >
          {generating ? 'Generating Review...' : error ? 'Try again' : 'Generate Review'}
        </Button>
      </div>
    </div>
  )
}

function GeneratingStep() {
  return (
    <div className="space-y-6 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto"></div>
      <h2 className="text-xl font-bold text-white">Generating your review...</h2>
      <p className="text-[var(--text-muted)]">AI is creating a natural review from your feedback</p>
    </div>
  )
}

function BuildingIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
}
function UsersIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
}
function CheckIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
}
function SparklesIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M5 21v-4M3 17h4M21 5v4M17 3h4M21 19v-4M17 21h4" /></svg>
}
function HeartIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
}
function BoltIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
}
function ChatIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
}
function StarIcon({ className }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
}
function ClockIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function XCircleIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function TrashIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
}
function FrownIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
}
function DollarIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}