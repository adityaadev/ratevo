import { Link } from 'react-router-dom'
import { Button } from '../components'

export default function Refund() {
  return (
    <div className="min-h-screen bg-bg py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-heading-lg font-bold text-white">Refund Policy</h1>
          <p className="mt-2 text-[var(--text-muted)]">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="card p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Subscription Billing</h2>
            <p className="mt-2 text-[var(--text-muted)]">Ratevo subscriptions are billed in advance on a monthly or annual basis. Prices are in USD and exclude applicable taxes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Free Trial</h2>
            <p className="mt-2 text-[var(--text-muted)]">New accounts may be eligible for a free trial period. No charges occur during the trial. At trial end, the selected plan begins automatically unless cancelled.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Cancellation</h2>
            <p className="mt-2 text-[var(--text-muted)]">You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No partial refunds for unused time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Refunds</h2>
            <p className="mt-2 text-[var(--text-muted)]">We generally do not offer refunds for paid subscription periods. Exceptions may be considered for:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-[var(--text-muted)]">
              <li>Billing errors (duplicate charges, incorrect amounts)</li>
              <li>Service unavailability exceeding 48 consecutive hours</li>
              <li>Legal requirements in your jurisdiction</li>
            </ul>
            <p className="mt-2 text-[var(--text-muted)]">Refund requests must be submitted within 14 days of the charge. Contact <a href="mailto:billing@xoiex.com" className="underline hover:text-white">billing@xoiex.com</a> with your account email and charge details.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Prorated Refunds</h2>
            <p className="mt-2 text-[var(--text-muted)]">If a refund is approved, it will be prorated based on unused days in the current billing period, minus any transaction fees.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Disputes</h2>
            <p className="mt-2 text-[var(--text-muted)]">If you dispute a charge with your payment provider without contacting us first, we reserve the right to suspend your account pending resolution.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">7. Changes to Pricing</h2>
            <p className="mt-2 text-[var(--text-muted)]">We may change subscription prices with 30 days&apos; notice. Continued use after the change constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">8. Contact</h2>
            <p className="mt-2 text-[var(--text-muted)]">For billing or refund questions, contact us at <a href="mailto:billing@xoiex.com" className="underline hover:text-white">billing@xoiex.com</a>.</p>
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