import { Link } from 'react-router-dom'
import { Button } from '../components'

export default function Contact() {
  return (
    <div className="min-h-screen bg-bg py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-heading-lg font-bold text-white">Contact Us</h1>
          <p className="mt-2 text-[var(--text-muted)]">We&apos;d love to hear from you</p>
        </header>

        <div className="card p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white">General Inquiries</h2>
            <p className="mt-2 text-[var(--text-muted)]">For general questions about Ratevo:</p>
            <p className="mt-1"><a href="mailto:hello@xoiex.com" className="underline hover:text-white">hello@xoiex.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Support</h2>
            <p className="mt-2 text-[var(--text-muted)]">For technical support, bugs, or feature requests:</p>
            <p className="mt-1"><a href="mailto:support@xoiex.com" className="underline hover:text-white">support@xoiex.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Legal & Privacy</h2>
            <p className="mt-2 text-[var(--text-muted)]">For legal, privacy, or data protection inquiries:</p>
            <p className="mt-1"><a href="mailto:legal@xoiex.com" className="underline hover:text-white">legal@xoiex.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Billing</h2>
            <p className="mt-2 text-[var(--text-muted)]">For billing, subscription, or refund questions:</p>
            <p className="mt-1"><a href="mailto:billing@xoiex.com" className="underline hover:text-white">billing@xoiex.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Press & Partnerships</h2>
            <p className="mt-2 text-[var(--text-muted)]">For media inquiries or partnership opportunities:</p>
            <p className="mt-1"><a href="mailto:press@xoiex.com" className="underline hover:text-white">press@xoiex.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Response Time</h2>
            <p className="mt-2 text-[var(--text-muted)]">We aim to respond to all inquiries within 2 business days. Support requests from active subscribers receive priority.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Company</h2>
            <p className="mt-2 text-[var(--text-muted)]">Ratevo by Xoiex</p>
            <p className="mt-1">Website: <a href="https://xoiex.com" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">xoiex.com</a></p>
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