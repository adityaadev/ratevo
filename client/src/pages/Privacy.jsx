import { Link } from 'react-router-dom'
import { Button } from '../components'
import { BUSINESS_CONFIG } from '../config/business'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-bg py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-heading-lg font-bold text-white">Privacy Policy</h1>
          <p className="mt-2 text-[var(--text-muted)]">Last updated: {new Date(BUSINESS_CONFIG.lastLegalReviewDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        {BUSINESS_CONFIG.showLawyerReviewBanner && (
          <div className="mb-8 p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-xl text-sm text-yellow-200">
            <strong>Note:</strong> This document is a placeholder and needs review by a qualified lawyer/CA before going live.
          </div>
        )}

        <div className="card p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
            <p className="mt-2 text-[var(--text-muted)]">We collect information you provide directly:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-[var(--text-muted)]">
              <li>Account information: email, password (hashed via Supabase Auth), name</li>
              <li>Business information: name, category, address, phone, Google Review URL</li>
              <li>Customer feedback: ratings (1-5 stars), selected feedback tags, optional custom text (anonymous, not linked to identity)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. How We Use Your Information</h2>
            <p className="mt-2 text-[var(--text-muted)]">We use collected information to:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-[var(--text-muted)]">
              <li>Provide and improve the Service</li>
              <li>Generate AI-assisted review drafts from customer feedback</li>
              <li>Display analytics to business owners (aggregate, anonymized)</li>
              <li>Send service-related communications (account, billing, security)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Data Sharing</h2>
            <p className="mt-2 text-[var(--text-muted)]">We do not sell personal data. We may share data with:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-[var(--text-muted)]">
              <li>Supabase (database & auth hosting — PostgreSQL with Row Level Security)</li>
              <li>Google OAuth (authentication — email, name, profile picture)</li>
              <li>Google Gemini API (AI review generation — customer feedback only, no PII)</li>
              <li>Analytics providers (anonymous event data, with consent where required)</li>
              <li>Service providers acting on our behalf under data processing agreements</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Customer Data (Review Sessions)</h2>
            <p className="mt-2 text-[var(--text-muted)]">Customer feedback is collected anonymously. We do not collect names, emails, or contact information from customers leaving reviews. Session data (rating, tags, custom text) is used solely for generating review drafts and aggregate analytics. The business never sees customer contact info.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Data Retention</h2>
            <p className="mt-2 text-[var(--text-muted)]">Account data is retained while your account is active. You may request deletion at any time by contacting {BUSINESS_CONFIG.supportEmail}. Anonymous review session data may be retained for analytics purposes. Deleted accounts are purged within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Security</h2>
            <p className="mt-2 text-[var(--text-muted)]">We implement reasonable security measures including encryption in transit (TLS 1.2+), encryption at rest (Supabase managed PostgreSQL), JWT-based authentication via Supabase Auth, and row-level security policies in the database ensuring data isolation per business.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">7. Your Rights</h2>
            <p className="mt-2 text-[var(--text-muted)]">Depending on your jurisdiction, you may have rights to: access, correct, delete, or port your data; object to processing; withdraw consent. Contact us at {BUSINESS_CONFIG.supportEmail} to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">8. Cookies & Analytics</h2>
            <p className="mt-2 text-[var(--text-muted)]">We use essential cookies for authentication (Supabase session). Optional analytics (e.g., Google Analytics) may be used with consent. Local storage stores anonymous event data for debugging. No third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">9. International Transfers</h2>
            <p className="mt-2 text-[var(--text-muted)]">Data may be processed in the United States and other countries where our providers (Supabase, Google) operate. We ensure adequate safeguards including Standard Contractual Clauses where applicable.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">10. Changes to This Policy</h2>
            <p className="mt-2 text-[var(--text-muted)]">We may update this policy. Material changes will be communicated via email or prominent notice on the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">11. Contact</h2>
            <p className="mt-2 text-[var(--text-muted)]">For privacy questions, contact us at <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="underline hover:text-white">{BUSINESS_CONFIG.supportEmail}</a>.</p>
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