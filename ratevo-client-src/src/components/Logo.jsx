import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../utils/helpers'

export const Logo = forwardRef(function Logo({
  size = 'md',
  showTagline = false,
  asChild = false,
  standalone = false,
  className = '',
  href = '/',
  'aria-label': ariaLabel = 'Ratevo Home',
  ...props
}, ref) {
  const sizeStyles = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  const taglineStyles = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  }

  const LogoContent = (
    <span className={cn('font-logo font-semibold tracking-[-0.02em] text-white', sizeStyles[size])}>
      Ratevo
    </span>
  )

  const children = standalone ? (
    LogoContent
  ) : asChild ? (
    LogoContent
  ) : (
    <Link href={href} className="inline-flex items-center gap-2" aria-label={ariaLabel} {...props}>
      {LogoContent}
      {showTagline && (
        <span className={cn('text-[var(--text-subtle)] uppercase tracking-wide font-sans', taglineStyles[size])}>
          by Xoiex
        </span>
      )}
    </Link>
  )

  return <span ref={ref} className={cn('flex items-center', className)}>{children}</span>
})

Logo.displayName = 'Logo'