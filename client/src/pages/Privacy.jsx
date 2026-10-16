import { Link } from 'react-router-dom'
import { Button } from '../components'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-bg py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-heading-lg font-bold text-white">Privacy Policy</h1>
          <p className="mt-2 text-[var(--text-muted)]">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="card p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
            <p className="mt-2 text-[var(--text-muted)]">We collect information you provide directly:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-[var(--text-muted)]">
              <li>Account information: email, password (hashed), name</li>
              <li>Business information: name, category, address, phone, Google Review URL</li>
              <li>Customer feedback: ratings, selected feedback options, custom text (anonymous, not linked to identity)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. How We Use Your Information</h2>
            <p className="mt-2 text-[var(--text-muted)]">We use collected information to:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-[var(--text-muted)]">
              <li>Provide and improve the Service</li>
              <li>Generate AI-assisted review drafts from customer feedback</li>
              <li>Display analytics to business owners</li>
              <li>Send service-related communications</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Data Sharing</h2>
            <p className="mt-2 text-[var(--text-muted)]">We do not sell personal data. We may share data with:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-[var(--text-muted)]">
              <li>Supabase (database & auth hosting)</li>
              <li>Google Gemini API (AI review generation - customer feedback only, no PII)</li>
              <li>Service providers acting on our behalf</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Customer Data (Review Sessions)</h2>
            <p className="mt-2 text-[var(--text-muted)]">Customer feedback is collected anonymously. We do not collect names, emails, or contact information from customers leaving reviews. Session data is used solely for generating review drafts and analytics.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Data Retention</h2>
            <p className="mt-2 text-[var(--text-muted)]">Account data is retained while your account is active. You may request deletion at any time. Anonymous review session data may be retained for analytics purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Security</h2>
            <p className="mt-2 text-[var(--text-muted)]">We implement reasonable security measures including encryption in transit (TLS), at rest (Supabase), JWT authentication, and row-level security in the database.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">7. Your Rights</h2>
            <p className="mt-2 text-[var(--text-muted)]">Depending on your jurisdiction, you may have rights to: access, correct, delete, or port your data; object to processing; withdraw consent. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">8. Cookies & Analytics</h2>
            <p className="mt-2 text-[var(--text-muted)]">We use essential cookies for authentication. Optional analytics (Google Analytics) may be used with consent. Local storage stores anonymous event data for debugging.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">9. International Transfers</h2>
            <p className="mt-2 text-[var(--text-muted)]">Data may be processed in the United States and other countries where our providers operate. We ensure adequate safeguards.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">10. Changes to This Policy</h2>
            <p className="mt-2 text-[var(--text-muted)]">We may update this policy. Material changes will be communicated via email or prominent notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">11. Contact</h2>
            <p className="mt-2 text-[var(--text-muted)]">For privacy questions, contact us at <a href="mailto:privacy@xoiex.com" className="underline hover:text-white">privacy@xoiex.com</a>.</p>
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