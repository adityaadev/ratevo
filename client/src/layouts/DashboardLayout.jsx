import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Logo } from '../components'
import { cn } from '../utils/helpers'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Business', href: '/dashboard/business', icon: BuildingIcon },
  { name: 'QR Code', href: '/dashboard/qr', icon: QrCodeIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
]

function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function BuildingIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function QrCodeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  )
}

function ChartIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function SettingsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function MenuIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeIndicator, setActiveIndicator] = useState({ top: 0, height: 0 })
  const navRef = useRef(null)

  const handleLogout = async () => {
    await logout()
  }

  // Update active indicator position
  useEffect(() => {
    if (navRef.current) {
      const activeLink = navRef.current.querySelector('[aria-current="page"]')
      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect()
        const linkRect = activeLink.getBoundingClientRect()
        setActiveIndicator({
          top: linkRect.top - navRect.top,
          height: linkRect.height,
        })
      }
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-bg text-[var(--text)] flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--surface)]/95 backdrop-blur-sm border-r border-[var(--border)] transform transition-transform duration-base ease-out-expo lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border)]">
            <Link to="/dashboard" className="flex items-center gap-2" aria-label="Ratevo Dashboard">
              <Logo size="md" showTagline standalone />
            </Link>
            <button
              className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors duration-fast"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <nav
            ref={navRef}
            className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto"
            aria-label="Main navigation"
          >
            {/* Active indicator */}
            <div
              className="absolute left-0 w-1 bg-white rounded-r-full transition-all duration-base ease-out-expo"
              style={{
                top: activeIndicator.top,
                height: activeIndicator.height,
              }}
              aria-hidden="true"
            />
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-fast ease-out-expo ${
                    isActive
                      ? 'text-white bg-[var(--surface-hover)]'
                      : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors duration-fast',
                    isActive ? 'text-white' : 'text-[var(--text-subtle)]'
                  )}>
                    <item.icon className="w-5 h-5" />
                  </span>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                <p className="text-xs text-[var(--text-subtle)]">Business Owner</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              width="full"
              onClick={handleLogout}
              className="mt-3 justify-center gap-2 text-[var(--text-muted)] hover:text-white hover:bg-white/5"
              icon={<LogoutIcon className="w-5 h-5" />}
            >
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <header className="sticky top-0 z-30 backdrop-blur-md bg-bg/80 border-b border-[var(--border)]">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors duration-fast"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none" />
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-[var(--text-subtle)] font-medium">
                Ratevo Dashboard
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}