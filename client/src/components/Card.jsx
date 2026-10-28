import { forwardRef } from 'react'
import { cn } from '../utils/helpers'

export const Card = forwardRef(function Card({
  children,
  hover = false,
  bordered = true,
  padding = 'lg',
  className = '',
  as: Component = 'div',
  ...props
}, ref) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  }

  return (
    <Component
      ref={ref}
      className={cn(
        'bg-[var(--surface)] rounded-2xl',
        bordered && 'border border-[var(--border)]',
        'shadow-card',
        hover && 'hover-lift',
        'transition-all duration-base ease-out-expo',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
})

Card.displayName = 'Card'

export const CardHeader = forwardRef(function CardHeader({
  children,
  className = '',
  ...props
}, ref) {
  return (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef(function CardTitle({
  children,
  className = '',
  ...props
}, ref) {
  return (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-[var(--text)]', className)}
      {...props}
    >
      {children}
    </h3>
  )
})

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef(function CardDescription({
  children,
  className = '',
  ...props
}, ref) {
  return (
    <p
      ref={ref}
      className={cn('mt-1 text-sm text-[var(--text-muted)]', className)}
      {...props}
    >
      {children}
    </p>
  )
})

CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef(function CardContent({
  children,
  className = '',
  ...props
}, ref) {
  return (
    <div
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef(function CardFooter({
  children,
  className = '',
  ...props
}, ref) {
  return (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardFooter.displayName = 'CardFooter'