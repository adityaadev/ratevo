import { Link, Outlet } from 'react-router-dom'
import { Button, Logo } from '../components'
import { BUSINESS_CONFIG, getWhatsAppUrl } from '../config/business'

export default function PublicLayout() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col bg-bg text-[var(--text)]">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/80 border-b border-[var(--border)] safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" showTagline />
            <nav className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors duration-fast px-3 py-2 rounded-xl hover:bg-white/5 focus-visible-ring"
              >
                Sign in
              </Link>
              <Button variant="primary" size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--border)] bg-bg/80 backdrop-blur-sm safe-bottom" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
            <div className="md:col-span-2 lg:col-span-2">
              <Logo size="md" className="mb-3" />
              <p className="text-sm text-[var(--text-muted)] max-w-xs">Turn real experiences into better reviews.</p>
              <p className="mt-4 text-sm text-[var(--text-subtle)]">
                Operated by {BUSINESS_CONFIG.legalName} ({BUSINESS_CONFIG.brandName} {BUSINESS_CONFIG.tagline})
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li><Link to="/pricing" className="hover:text-white transition-colors focus-visible-ring rounded">Pricing</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors focus-visible-ring rounded">How it works</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors focus-visible-ring rounded">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li><Link to="/terms" className="hover:text-white transition-colors focus-visible-ring rounded">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors focus-visible-ring rounded">Privacy Policy</Link></li>
                <li><Link to="/refund" className="hover:text-white transition-colors focus-visible-ring rounded">Refund Policy</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors focus-visible-ring rounded">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li>
                  <a href={`tel:+91${BUSINESS_CONFIG.supportPhone}`} className="hover:text-white transition-colors focus-visible-ring rounded">
                    +91 {BUSINESS_CONFIG.supportPhone.slice(0, 5)} {BUSINESS_CONFIG.supportPhone.slice(5)}
                  </a>
                </li>
                <li>
                  <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors focus-visible-ring rounded flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.182.284-.528.248-.696-.038-.173-.381-.675-.708-1.379-.329-.709-.537-1.148-.64-1.31-.103-.162-.24-.316-.368-.465a4.43 4.43 0 0 0-.516-.381 4.71 4.71 0 0 0-.573-.242c-.417-.096-1.132-.116-1.694.103-.56.218-1.07.578-1.465 1.134-.395.556-.717 1.376-.89 2.023-.173.645-.223 1.307-.196 1.93.027.633.262 1.477.865 2.18.603.703 1.542 2.017 2.955 3.194 1.21 1.006 2.122 1.69 2.68 2.13.558.44 1.328.754 2.236.827.622.05 1.161-.144 1.374-.461.18-.266.26-.594.26-.918 0-.297-.018-.525-.037-.61zM12 2C6.477 2 2 6.477 2 12c0 2.368.881 4.533 2.34 6.207l-.928 3.506 3.63-.96c1.675.924 3.567 1.768 5.46 1.768 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="hover:text-white transition-colors focus-visible-ring rounded">
                    {BUSINESS_CONFIG.supportEmail}
                  </a>
                </li>
                <li>{BUSINESS_CONFIG.supportHours}</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--text-subtle)]">
            <p>&copy; {currentYear} {BUSINESS_CONFIG.brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}