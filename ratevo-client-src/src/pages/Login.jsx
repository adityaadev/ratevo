import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Logo } from '../components'
import { cn } from '../utils/helpers'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

export default function Login() {
  const { login, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed')) {
        navigate('/verify-otp', { 
          state: { email, type: 'email' },
          replace: true 
        })
      } else {
        setFormError(msg || 'Login failed. Please try again.')
      }
    }
  }

  const handleGoogleLogin = async () => {
    setFormError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('oauth') || msg.includes('provider') || msg.includes('google')) {
        setFormError('Google sign-in failed. Please try again or use email/password.')
      } else if (msg.includes('already registered') || msg.includes('already exists')) {
        setFormError('An account with this email already exists. Please sign in with your password.')
      } else {
        setFormError(msg || 'Google sign-in failed. Please try again.')
      }
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" showTagline />
          <h1 className="text-heading-md font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-[var(--text-muted)]">Sign in to your account to continue</p>
        </div>

        <div className="card p-6">
          {formError && (
            <div className="mb-4 p-3 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl text-[var(--error)] text-sm" role="alert">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              width="full"
              onClick={handleGoogleLogin}
              disabled={loading}
              icon={<GoogleIcon />}
            >
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--surface)] text-[var(--text-muted)]">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              width="full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-white hover:opacity-70 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}