import { cn } from '../utils/helpers'
import { formatAmount } from '../config/billing'

export function PricingCardTeaser({ plan }) {
  const isYearly = plan.id === 'yearly'

  return (
    <div className={cn(
      'card p-6 relative',
      isYearly && 'border-white/20'
    )}>
      {plan.label && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-white text-black text-xs font-semibold px-3 py-1 rounded-full">
            {plan.label}
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
        <div className="mt-3 flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-white mono">{formatAmount(plan.amountPaise)}</span>
          <span className="text-[var(--text-muted)] self-end pb-1">/month</span>
        </div>
        {plan.regularPriceDisplay && (
          <p className="mt-1 text-sm text-[var(--text-subtle)] line-through">
            Regular: {formatAmount(parseInt(plan.regularPriceDisplay) * 100)}/month
          </p>
        )}
        {isYearly && (
          <p className="mt-1 text-sm text-green-400">
            Billed yearly: {formatAmount(plan.amountPaise)}
          </p>
        )}
      </div>

      <ul className="space-y-2 mb-6">
        <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Unlimited QR codes & scans
        </li>
        <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          AI-powered review generation
        </li>
        <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Real-time analytics dashboard
        </li>
        <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          &ldquo;Copy & Open Google Review&rdquo; flow
        </li>
      </ul>

      <button className={cn(
        'w-full px-4 py-2 rounded-xl font-medium text-sm transition-colors duration-fast',
        isYearly
          ? 'bg-white text-black hover:bg-gray-200'
          : 'bg-transparent border border-[var(--border-strong)] text-white hover:bg-[var(--surface-hover)] hover:border-white/30'
      )}>
        Start {plan.name} plan
      </button>
    </div>
  )
}