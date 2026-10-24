import { Link } from 'react-router-dom'
import { Button } from '.'

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}) {
  return (
    <div className={`max-w-md mx-auto text-center py-16 ${className}`}>
      {icon && (
        <div className="mx-auto h-16 w-16 text-[var(--text-subtle)] flex items-center justify-center">
          {icon}
        </div>
      )}
      <h2 className="mt-4 text-heading-md font-semibold text-white">{title}</h2>
      {description && (
        <p className="mt-2 text-[var(--text-muted)]">{description}</p>
      )}
      {action && (
        <Button 
          variant={action.variant || 'primary'} 
          size="lg" 
          asChild 
          className="mt-6"
        >
          <Link to={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}

export function BusinessEmptyState() {
  return (
    <EmptyState
      icon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      }
      title="No business yet"
      description="Create your first business to start collecting reviews"
      action={{ label: "Create Business", href: "/dashboard/business" }}
    />
  )
}

export function AnalyticsEmptyState() {
  return (
    <EmptyState
      icon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
      title="No analytics yet"
      description="Analytics will appear once customers start scanning your QR code"
    />
  )
}

export function PaymentHistoryEmptyState() {
  return (
    <EmptyState
      icon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      }
      title="No payment history"
      description="Your subscription payments will appear here"
    />
  )
}

export function SearchEmptyState({ query }) {
  return (
    <EmptyState
      icon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      title="No results found"
      description={`No matches for "${query}"`}
    />
  )
}

export function ErrorEmptyState({ 
  message = "Something went wrong", 
  onRetry 
}) {
  return (
    <EmptyState
      icon={
        <svg className="text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      }
      title="Unable to load"
      description={message}
      action={onRetry ? { label: "Try again", href: "#", variant: "primary" } : undefined}
    />
  )
}