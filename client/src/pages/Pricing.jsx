import { Link } from 'react-router-dom'
import { Button } from '../components'
import { BILLING_CONFIG, getPlanFeatures, formatAmount } from '../config/billing'
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../config/business'

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
            No credit card required to start. Cancel anytime.
          </p>
          <p className="mt-4 text-base text-[var(--text-muted)] max-w-[640px] mx-auto leading-relaxed">
            Ratevo is a web-based software (SaaS) that helps businesses collect customer feedback through QR codes and draft a Google review that the customer edits and posts themselves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
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
              question="Can I switch plans later?" 
              answer="Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately with prorated charges. Downgrades take effect at the end of your current billing period."
            />
            <FAQItem 
              question="What payment methods do you accept?" 
              answer="We accept all major payment methods through Cashfree: UPI, credit/debit cards, net banking, and wallets. All payments are processed in INR."
            />
            <FAQItem 
              question="What's your refund policy?" 
              answer="Monthly plan: no refund after activation except for a billing error (duplicate or wrong charge). Yearly plan: refund on request within 7 days of activation. Contact ratevo.business@gmail.com or WhatsApp to request. Refund review within 7 working days."
            />
            <FAQItem 
              question="How does the monthly review cap work?" 
              answer="Each business can generate up to 300 AI reviews per month. This resets at the start of each billing cycle. The limit applies per business, not per account."
            />
          </div>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="card p-6 sm:p-8 text-center">
            <h3 className="text-lg font-semibold text-white mb-3">Online payments are coming soon</h3>
            <p className="text-[var(--text-muted)] mb-6 max-w-xl mx-auto">
              To activate a plan now, message us on WhatsApp with the plan name and we&apos;ll set you up manually.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" asChild>
                <a 
                  href={getWhatsAppUrl(`Hi, I'd like to activate the Monthly plan (₹99/month) for my business.`)}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.182.284-.528.248-.696-.038-.173-.381-.675-.708-1.379-.329-.709-.537-1.148-.64-1.31-.103-.162-.24-.316-.368-.465a4.43 4.43 0 0 0-.516-.381 4.71 4.71 0 0 0-.573-.242c-.417-.096-1.132-.116-1.694.103-.56.218-1.07.578-1.465 1.134-.395.556-.717 1.376-.89 2.023-.173.645-.223 1.307-.196 1.93.027.633.262 1.477.865 2.18.603.703 1.542 2.017 2.955 3.194 1.21 1.006 2.122 1.69 2.68 2.13.558.44 1.328.754 2.236.827.622.05 1.161-.144 1.374-.461.18-.266.26-.594.26-.918 0-.297-.018-.525-.037-.61zM12 2C6.477 2 2 6.477 2 12c0 2.368.881 4.533 2.34 6.207l-.928 3.506 3.63-.96c1.675.924 3.567 1.768 5.46 1.768 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                  Activate Monthly Plan (₹99/mo)
                </a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a 
                  href={getWhatsAppUrl(`Hi, I'd like to activate the Yearly plan (₹1,099/year) for my business.`)}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.182.284-.528.248-.696-.038-.173-.381-.675-.708-1.379-.329-.709-.537-1.148-.64-1.31-.103-.162-.24-.316-.368-.465a4.43 4.43 0 0 0-.516-.381 4.71 4.71 0 0 0-.573-.242c-.417-.096-1.132-.116-1.694.103-.56.218-1.07.578-1.465 1.134-.395.556-.717 1.376-.89 2.023-.173.645-.223 1.307-.196 1.93.027.633.262 1.477.865 2.18.603.703 1.542 2.017 2.955 3.194 1.21 1.006 2.122 1.69 2.68 2.13.558.44 1.328.754 2.236.827.622.05 1.161-.144 1.374-.461.18-.266.26-.594.26-.918 0-.297-.018-.525-.037-.61zM12 2C6.477 2 2 6.477 2 12c0 2.368.881 4.533 2.34 6.207l-.928 3.506 3.63-.96c1.675.924 3.567 1.768 5.46 1.768 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                  Activate Yearly Plan (₹1,099/yr)
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[var(--text-muted)]">
            Need a custom plan or have questions?{' '}
            <Link to="/contact" className="text-white hover:underline font-medium">
              Contact us
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
          <p className="mt-2 text-sm text-white">
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