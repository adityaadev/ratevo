import { Link } from 'react-router-dom'
import { Button } from '../components'
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../config/business'

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
            <h2 className="text-lg font-semibold text-white">Company Information</h2>
            <dl className="mt-4 space-y-3 text-[var(--text-muted)]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="font-medium text-white min-w-0 sm:min-w-[140px]">Legal name:</dt>
                <dd>{BUSINESS_CONFIG.legalName}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="font-medium text-white min-w-0 sm:min-w-[140px]">Brand:</dt>
                <dd>{BUSINESS_CONFIG.brandName} {BUSINESS_CONFIG.tagline}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="font-medium text-white min-w-0 sm:min-w-[140px]">Address:</dt>
                <dd>{BUSINESS_CONFIG.address}</dd>
              </div>
              {BUSINESS_CONFIG.gstin && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <dt className="font-medium text-white min-w-0 sm:min-w-[140px]">GSTIN:</dt>
                  <dd>{BUSINESS_CONFIG.gstin}</dd>
                </div>
              )}
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Support Channels</h2>
            <dl className="mt-4 space-y-3 text-[var(--text-muted)]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="font-medium text-white min-w-0 sm:min-w-[140px]">Email:</dt>
                <dd><a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="underline hover:text-white">{BUSINESS_CONFIG.supportEmail}</a></dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="font-medium text-white min-w-0 sm:min-w-[140px]">Phone:</dt>
                <dd><a href={`tel:+91${BUSINESS_CONFIG.supportPhone}`} className="underline hover:text-white">+91 {BUSINESS_CONFIG.supportPhone.slice(0,5)} {BUSINESS_CONFIG.supportPhone.slice(5)}</a></dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="font-medium text-white min-w-0 sm:min-w-[140px]">WhatsApp:</dt>
                <dd>
                  <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="underline hover:text-white flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.182.284-.528.248-.696-.038-.173-.381-.675-.708-1.379-.329-.709-.537-1.148-.64-1.31-.103-.162-.24-.316-.368-.465a4.43 4.43 0 0 0-.516-.381 4.71 4.71 0 0 0-.573-.242c-.417-.096-1.132-.116-1.694.103-.56.218-1.07.578-1.465 1.134-.395.556-.717 1.376-.89 2.023-.173.645-.223 1.307-.196 1.93.027.633.262 1.477.865 2.18.603.703 1.542 2.017 2.955 3.194 1.21 1.006 2.122 1.69 2.68 2.13.558.44 1.328.754 2.236.827.622.05 1.161-.144 1.374-.461.18-.266.26-.594.26-.918 0-.297-.018-.525-.037-.61zM12 2C6.477 2 2 6.477 2 12c0 2.368.881 4.533 2.34 6.207l-.928 3.506 3.63-.96c1.675.924 3.567 1.768 5.46 1.768 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                    Message us on WhatsApp
                  </a>
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="font-medium text-white min-w-0 sm:min-w-[140px]">Hours:</dt>
                <dd>{BUSINESS_CONFIG.supportHours}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Other Inquiries</h2>
            <ul className="mt-4 space-y-2 text-[var(--text-muted)]">
              <li><strong>Legal & Privacy:</strong> <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="underline hover:text-white">{BUSINESS_CONFIG.supportEmail}</a></li>
              <li><strong>Billing & Refunds:</strong> <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="underline hover:text-white">{BUSINESS_CONFIG.supportEmail}</a></li>
              <li><strong>Press & Partnerships:</strong> <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="underline hover:text-white">{BUSINESS_CONFIG.supportEmail}</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Response Time</h2>
            <p className="mt-2 text-[var(--text-muted)]">We aim to respond to all inquiries within 2 business days. Support requests from active subscribers receive priority.</p>
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