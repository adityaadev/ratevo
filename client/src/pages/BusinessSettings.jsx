import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components'

export default function BusinessSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('account')

  const tabs = [
    { id: 'account', label: 'Account', icon: UserIcon },
    { id: 'security', label: 'Security', icon: ShieldIcon },
    { id: 'billing', label: 'Billing', icon: CreditCardIcon },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-white">Settings</h1>
        <p className="text-[var(--text-muted)]">Manage your account and preferences</p>
      </div>

      <div className="card">
        <div className="border-b border-[var(--border)]">
          <nav className="flex -mb-px" aria-label="Settings tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-[var(--text-muted)] hover:text-white hover:border-[var(--border)]'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'account' && <AccountTab user={user} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'billing' && <BillingTab />}
        </div>
      </div>
    </div>
  )
}

function AccountTab({ user }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: 'success', text: 'Profile updated successfully' })
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-md">
      {message && (
        <div className={`p-3 rounded-xl text-sm ${
          message.type === 'success' 
            ? 'bg-white/5 border border-white/10 text-white' 
            : 'bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error)]'
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">Email</label>
        <input
          id="email"
          type="email"
          value={user?.email || ''}
          disabled
          className="input bg-white/5"
        />
        <p className="mt-1 text-sm text-[var(--text-subtle)]">Email cannot be changed</p>
      </div>

      <div>
        <label htmlFor="name" className="label">Display Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="Your name"
        />
      </div>

      <Button type="submit" variant="primary" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    setSaving(true)
    setMessage({ type: 'success', text: 'Password updated successfully' })
    setTimeout(() => {
      setSaving(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }, 1000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-md">
      {message && (
        <div className={`p-3 rounded-xl text-sm ${
          message.type === 'success' 
            ? 'bg-white/5 border border-white/10 text-white' 
            : 'bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error)]'
        }`}>
        {message.text}
      </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="label">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="label">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              minLength={8}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={saving}>
        {saving ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  )
}

function BillingTab() {
  return (
    <div className="max-w-md">
      <div className="card p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-white">Billing Coming Soon</h3>
        <p className="mt-2 text-[var(--text-muted)]">Subscription management and billing history will be available here.</p>
        <p className="mt-4 text-sm text-[var(--text-subtle)]">Ratevo is currently in free beta.</p>
      </div>
    </div>
  )
}

function UserIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}
function ShieldIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
}
function CreditCardIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
}