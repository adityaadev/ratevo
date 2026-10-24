import { cn } from '../utils/helpers'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-white/5 rounded-xl',
        className
      )}
      {...props}
    />
  )
}

export function CardSkeleton({ className }) {
  return (
    <div className={cn('card p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="card">
      <div className="p-6 border-b border-[var(--border)]">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="divide-y divide-[var(--border)]">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            {[...Array(cols)].map((_, j) => (
              <Skeleton key={j} className="h-4 w-32 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton({ items = 5 }) {
  return (
    <div className="card divide-y divide-[var(--border)]">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  )
}

export function DashboardStatSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  )
}

export function QRCodeSkeleton() {
  return (
    <div className="card p-6 space-y-6">
      <div className="text-center">
        <Skeleton className="mx-auto h-48 w-48 rounded-xl border border-white/10" />
        <Skeleton className="mt-4 h-4 w-64 mx-auto" />
      </div>
      <div className="border-t border-[var(--border)] pt-6 space-y-4">
        <div>
          <Skeleton className="h-4 w-32 mx-auto mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 w-full sm:w-1/2" />
          <Skeleton className="h-10 w-full sm:w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function BillingStatusSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-48" />
    </div>
  )
}

export function PaymentHistorySkeleton() {
  return (
    <div className="card">
      <div className="p-6 border-b border-[var(--border)]">
        <Skeleton className="h-6 w-40" />
      </div>
      <TableSkeleton rows={5} cols={5} />
    </div>
  )
}