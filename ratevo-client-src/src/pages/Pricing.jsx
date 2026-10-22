import { Link } from 'react-router-dom'
import { Button } from '../components'
import { BILLING_CONFIG, getPlanFeatures, formatAmount } from '../config/billing'

export default function Pricing() {
  const plans = Object.values(BILLING_CONFIG.plans)

  return (
    <div className="min-h-screen bg-bg py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-heading-lg font-bold text-white tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-[var(--text-muted)]">
            Start with a 7-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="card p-8">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">What&apos;s included in all plans</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[var(--text-muted)]">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited QR codes & scans
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI-powered review generation
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time analytics dashboard
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                &ldquo;Copy & Open Google Review&rdquo; flow
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                QR code download (PNG)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Email support
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Frequently asked billing questions</h2>
          <div className="card p-6 space-y-4">
            <FAQItem 
              question="What happens after my 7-day free trial?" 
              answer="After your trial ends, you'll need to choose a plan to continue using Ratevo. Your data and QR codes are preserved. If you don't upgrade, your account enters a 5-day grace period where customers can still leave reviews, but you can't generate new AI reviews."
            />
            <FAQItem 
              question="Can I switch plans later?" 
              answer="Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately with prorated charges. Downgrades take effect at the end of your current billing period."
            />
            <FAQItem 
              question="What payment methods do you accept?" 
              answer="We accept all major payment methods through Cashfree: UPI, credit/debit cards, net banking, and wallets. All payments are processed securely in INR."
            />
            <FAQItem 
              question="Is GST included in the price?" 
              answer={BILLING_CONFIG.showGstInclusive 
                ? "Yes, all prices shown include 18% GST. You'll receive a GST-compliant receipt for each payment." 
                : "No, prices shown exclude 18% GST which will be added at checkout."
              }
            />
            <FAQItem 
              question="What's your refund policy?" 
              answer="We offer refunds for billing errors (duplicate charges, incorrect amounts) within 14 days. Service unavailability exceeding 48 hours may also qualify. See our Refund Policy for full details."
            />
            <FAQItem 
              question="How does the monthly review cap work?" 
              answer={`Each business can generate up to ${BILLING_CONFIG.monthlyReviewCap} AI reviews per month. This resets at the start of each billing cycle. The limit applies per business, not per account.`}
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[var(--text-muted)]">
            Need a custom plan or have questions?{' '}
            <Link to="/contact" className="text-white hover:underline font-medium">
              Contact sales
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function PlanCard({ plan }) {
  const features = getPlanFeatures(plan.id)
  const isYearly = plan.id === 'yearly'

  return (
    <div className={`card p-8 relative ${isYearly ? 'border-white/20' : ''}`}>
      {plan.label && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-white text-black text-xs font-semibold px-3 py-1 rounded-full">
            {plan.label}
          </span>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
        <div className="mt-4 flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-white mono">{formatAmount(plan.amountPaise)}</span>
          <span className="text-[var(--text-muted)] self-end pb-1">/month</span>
        </div>
        {plan.regularPriceDisplay && (
          <p className="mt-2 text-sm text-[var(--text-subtle)] line-through">
            Regular: {formatAmount(parseInt(plan.regularPriceDisplay) * 100)}/month
          </p>
        )}
        {isYearly && (
          <p className="mt-2 text-sm text-green-400">
            Billed yearly: {formatAmount(plan.amountPaise)}
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-[var(--text-muted)]">
            <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <Button 
        variant={isYearly ? 'primary' : 'secondary'} 
        width="full" 
        size="lg"
        asChild
      >
        <Link to="/signup">Start {plan.name} plan</Link>
      </Button>
    </div>
  )
}

function FAQItem({ question, answer }) {
  return (
    <details className="group">
      <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-white/5 rounded-xl">
        <span className="font-medium text-white">{question}</span>
        <svg className="w-5 h-5 text-[var(--text-subtle)] transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 text-[var(--text-muted)] animate-slide-down">
        {answer}
      </div>
    </details>
  )
}