import { Link } from 'react-router-dom'
import { Button, PricingCardTeaser } from '../components'
import { BILLING_CONFIG } from '../config/billing'

export default function Home() {
  const plans = Object.values(BILLING_CONFIG.plans)

  return (
    <div className="flex-1 flex flex-col bg-bg">
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[800px] mx-auto">
            <h1 className="font-semibold text-white tracking-[-0.03em] leading-[1.1] text-balance"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', lineHeight: '1.1', letterSpacing: '-0.03em' }}>
              Turn real experiences into <span className="text-white">better reviews</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-[var(--text-muted)] max-w-[560px] mx-auto leading-relaxed">
              Customers scan a QR code, share real feedback, and get a ready-to-edit Google review draft in seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" asChild>
                <Link to="/signup">Start Free</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 max-w-[800px] mx-auto">
            <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(ellipse at top, rgba(255,255,255,0.04) 0%, transparent 60%)',
              }}>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--text-muted)]">Rating</span>
                  <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                    {[1,2,3,4,5].map((n) => (
                      <svg key={n} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[var(--border)] pt-5 space-y-3">
                  <p className="text-sm text-[var(--text-muted)]">&ldquo;The team was attentive and the service was excellent. Would definitely recommend to others.&rdquo;</p>
                  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--text)] leading-relaxed font-mono text-xs sm:text-sm">
                    The staff was incredibly helpful and patient. They took the time to explain everything clearly and made sure I was comfortable throughout the entire process. The facility was clean and modern. Highly recommend!
                  </div>
                </div>
                <Button variant="primary" size="md" className="w-full sm:w-auto mt-2">
                  Copy & Open Google Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-white/10 rounded-full mb-4">Launch Offer</span>
            <h2 className="text-heading-lg font-bold text-white tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-[var(--text-muted)]">
              Start with a 7-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {plans.map((plan) => (
              <PricingCardTeaser key={plan.id} plan={plan} />
            ))}
          </div>

          <div className="text-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/pricing">View full pricing & FAQ</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 lg:py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-heading-lg font-bold text-white tracking-tight">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step number="1" title="Scan the QR code" description="Customer opens their camera, scans the code, and lands on a simple rating page.">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </Step>
            <Step number="2" title="Share your feedback" description="Rate the experience, pick what stood out, and add a sentence in your own words.">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Step>
            <Step number="3" title="Copy and post on Google" description="AI generates a natural draft. Customer reviews, copies, and posts directly on Google with one click.">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </Step>
          </div>
        </div>
      </section>
    </div>
  )
}

function Step({ number, title, description, children }) {
  return (
    <div className="card p-6 relative animate-fade-in-up">
      <span className="absolute -top-3 left-6 w-6 h-6 rounded-full bg-white text-black text-xs font-semibold flex items-center justify-center mono">
        {number}
      </span>
      <div className="pt-2">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4 text-white">
          {children}
        </div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>
      </div>
    </div>
  )
}