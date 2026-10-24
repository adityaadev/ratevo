import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Logo } from '../components'
import { cn } from '../utils/helpers'

export default function VerifyOTP() {
  const { verifyOtp, resendOtp, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [email, setEmail] = useState('')
  const [type, setType] = useState('signup')
  const [initialLoad, setInitialLoad] = useState(true)
  
  const inputRefs = useRef([])

  const fullCode = code.join('')
  const isComplete = fullCode.length === 6

  useEffect(() => {
    if (initialLoad) {
      const state = location.state || {}
      if (state.email) {
        setEmail(state.email)
      }
      if (state.type) {
        setType(state.type)
      }
      setInitialLoad(false)
    }
  }, [location.state, initialLoad])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  const handleCodeChange = useCallback((index, value) => {
    if (!/^\d*$/.test(value)) return
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError('')
    
    if (value && index < 5) {
      setFocusedIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    } else if (!value && index > 0) {
      setFocusedIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    }
    
    if (isComplete && fullCode.length < 6) {
      handleVerify()
    }
  }, [code, fullCode, isComplete])

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      setFocusedIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      setFocusedIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }, [code])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('')
      setCode(digits)
      digits.forEach((_, i) => inputRefs.current[i]?.focus())
      setFocusedIndex(5)
      handleVerify()
    }
  }, [])

  const handleVerify = async () => {
    if (!isComplete || isVerifying) return
    
    setIsVerifying(true)
    setError('')
    
    try {
      await verifyOtp(email, fullCode, type)
      setInfo('Verification successful! Redirecting...')
      if (type === 'signup') {
        navigate('/dashboard/business', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      const msg = err.message || 'Verification failed'
      setWrongAttempts(prev => prev + 1)
      
      if (msg.includes('expired') || msg.includes('invalid') || msg.includes('Invalid')) {
        setError('This code has expired or is invalid. Please request a new code.')
      } else if (msg.includes('too many') || msg.includes('rate limit') || msg.includes('rate_limit')) {
        setError('Too many attempts. Please wait before trying again.')
      } else if (msg.includes('wrong') || msg.includes('incorrect') || msg.includes('Invalid')) {
        setError('Incorrect code. Please try again.')
      } else {
        setError(msg)
      }
      
      setCode(['', '', '', '', '', ''])
      setFocusedIndex(0)
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    
    try {
      await resendOtp(email, type)
      setResendCooldown(60)
      setWrongAttempts(0)
      setInfo('A new code has been sent to your email.')
      setError('')
    } catch (err) {
      const msg = err.message || 'Failed to resend code'
      if (msg.includes('too many') || msg.includes('rate limit') || msg.includes('rate_limit')) {
        setError('Too many requests. Please wait before resending.')
      } else {
        setError('Failed to resend code. Please try again.')
      }
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" showTagline />
          <h1 className="text-heading-md font-bold text-white mt-4">Enter the 6-digit code</h1>
          <p className="mt-2 text-[var(--text-muted)]">
            We sent a code to <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 p-3 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl text-[var(--error)] text-sm" role="alert">
              {error}
            </div>
          )}
          
          {info && (
            <div className="mb-4 p-3 bg-white/5 border border-[var(--border)] rounded-xl text-[var(--text-muted)] text-sm" role="status">
              {info}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-4">
            <div className="flex items-center justify-center gap-3" role="group" aria-label="6-digit verification code">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  onFocus={() => setFocusedIndex(index)}
                  className={cn(
                    'w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl sm:text-3xl font-bold text-white',
                    'bg-[var(--surface)] border-2 rounded-xl transition-all duration-fast',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg',
                    focusedIndex === index
                      ? 'border-white focus:ring-white'
                      : 'border-[var(--border)] focus:border-white',
                    isVerifying && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={isVerifying}
                  autoComplete="one-time-code"
                  autoFocus={index === 0 && !initialLoad}
                  aria-label={`Digit ${index + 1} of 6`}
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              width="full"
              disabled={!isComplete || isVerifying || authLoading}
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className={cn(
                  'text-white hover:opacity-70 font-medium transition-opacity',
                  resendCooldown > 0 && 'opacity-50 cursor-not-allowed'
                )}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </p>
            
            {wrongAttempts > 0 && (
              <p className="text-xs text-[var(--text-subtle)]">
                {wrongAttempts} incorrect attempt{wrongAttempts !== 1 ? 's' : ''}. 
                After 5 attempts, you&apos;ll need to wait before trying again.
              </p>
            )}

            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-[var(--text-muted)] hover:text-white transition-colors"
            >
              ← Back to {type === 'signup' ? 'sign up' : 'sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}