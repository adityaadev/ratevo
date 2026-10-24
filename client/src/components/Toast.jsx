import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '../utils/helpers'

const ToastContext = createContext(null)

const toastStyles = {
  default: 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]',
  success: 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]',
  warning: 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]',
  danger: 'bg-[var(--error-bg)] border-[var(--error-border)] text-[var(--error)]',
  info: 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]',
}

const iconStyles = {
  default: 'text-[var(--text-muted)]',
  success: 'text-white',
  warning: 'text-white',
  danger: 'text-[var(--error)]',
  info: 'text-white',
}

const icons = {
  default: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  danger: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

function Toast({ toast, onClose }) {
  const style = toastStyles[toast.type] || toastStyles.default
  const iconStyle = iconStyles[toast.type] || iconStyles.default
  const icon = icons[toast.type] || icons.default

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border',
        'shadow-card-hover animate-slide-in-right',
        'min-w-[300px] max-w-md',
        style
      )}
      role="alert"
      aria-live="polite"
    >
      <div className={cn('flex-shrink-0 mt-0.5', iconStyle)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-medium text-[var(--text)]">{toast.title}</p>
        )}
        {toast.message && (
          <p className={cn('mt-1 text-sm', toast.title ? 'text-[var(--text-muted)]' : 'text-[var(--text)]')}>
            {toast.message}
          </p>
        )}
      </div>
      {toast.action && (
        <button
          onClick={toast.action.onClick}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-xl transition-colors duration-fast',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg',
            toast.type === 'danger'
              ? 'bg-[var(--error)] text-white hover:bg-[var(--error)]/90 focus:ring-[var(--error)]'
              : 'bg-white text-black hover:bg-white/90 focus:ring-white'
          )}
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 text-[var(--text-subtle)] hover:text-white transition-colors duration-fast"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ToastProvider({ children, position = 'bottom-right' }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        className={cn(
          'fixed z-50 flex flex-col gap-2 pointer-events-none',
          positionStyles[position]
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}