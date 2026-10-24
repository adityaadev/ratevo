import { Link } from 'react-router-dom'
import { Button } from '../components'
import { BUSINESS_CONFIG } from '../config/business'

export default function Refund() {
  return (
    <div className="min-h-screen bg-bg py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-heading-lg font-bold text-white">Refund and Cancellation Policy</h1>
          <p className="mt-2 text-[var(--text-muted)]">Last updated: {new Date(BUSINESS_CONFIG.lastLegalReviewDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="card p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Service Delivery</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              {BUSINESS_CONFIG.brandName} is a digital SaaS service. Access is provisioned online immediately upon successful payment confirmation. 
              No physical goods are shipped. The service includes QR code generation, customer feedback collection, AI review drafting, and analytics dashboard access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Cancellation</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              You may cancel your subscription at any time from your dashboard or by contacting support. 
              Cancellation takes effect at the end of the current billing period. 
              You retain access to all features until the period ends. 
              No partial refunds are provided for unused time in the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Refund Policy</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              Monthly plan: no refund after activation except for a billing error (duplicate or wrong charge).
            </p>
            <p className="mt-2 text-[var(--text-muted)]">
              Yearly plan: refund on request within 7 days of activation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. How to Request a Refund</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              Contact <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="underline hover:text-white">{BUSINESS_CONFIG.supportEmail}</a> 
              or <a href={BUSINESS_CONFIG.whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">WhatsApp</a> 
              with your account email, charge date, amount, and reason.
            </p>
            <p className="mt-2 text-[var(--text-muted)]">
              Refund review within 7 working days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Disputes & Chargebacks</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              If you dispute a charge with your payment provider or bank without contacting us first, 
              we reserve the right to suspend your account pending resolution of the dispute. 
              We encourage you to reach out to support first for a faster resolution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Changes to Pricing</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              We may change subscription prices with 30 days&apos; notice. 
              Continued use after the change constitutes acceptance. 
              Existing subscribers will be notified via email before any price change takes effect.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Button variant="secondary" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}