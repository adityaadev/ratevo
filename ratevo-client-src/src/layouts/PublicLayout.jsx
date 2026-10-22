import { Link, Outlet } from 'react-router-dom'
import { Button, Logo } from '../components'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-[var(--text)]">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" showTagline />
            <nav className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors duration-fast px-3 py-2 rounded-xl hover:bg-white/5"
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
      <footer className="border-t border-[var(--border)] bg-bg/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <Logo size="md" className="mb-3" />
              <p className="text-sm text-[var(--text-muted)]">Turn real experiences into better reviews.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--text-subtle)]">
            <p>&copy; {new Date().getFullYear()} Xoiex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}