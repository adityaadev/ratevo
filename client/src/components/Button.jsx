import { forwardRef, isValidElement, cloneElement } from 'react'
import { cn } from '../utils/helpers'

const variantStyles = {
  primary: 'bg-white text-black hover:bg-white/90 focus:ring-white',
  secondary: 'bg-transparent border border-[var(--border-strong)] text-white hover:bg-[var(--surface-hover)] hover:border-white/30 focus:ring-white',
  outline: 'border border-[var(--border-strong)] text-white hover:bg-[var(--surface-hover)] hover:border-white/30 focus:ring-white',
  ghost: 'text-white hover:bg-white/10 focus:ring-white',
  danger: 'bg-transparent border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error-bg)] focus:ring-[var(--error)]',
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm gap-1.5 min-h-[44px]',
  md: 'px-4 py-2 text-sm gap-2 min-h-[44px]',
  lg: 'px-6 py-3 text-base gap-2.5 min-h-[44px]',
  xl: 'px-8 py-4 text-lg gap-3 min-h-[44px]',
}

const widthStyles = {
  full: 'w-full',
  auto: 'w-auto',
}

export const Button = forwardRef(function Button({
  children,
  variant = 'primary',
  size = 'md',
  width = 'auto',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  className = '',
  type = 'button',
  asChild = false,
  ...props
}, ref) {
  const isDisabled = disabled || loading

  const buttonClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-xl',
    'transition-all duration-fast ease-out-expo',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.98]',
    variantStyles[variant],
    sizeStyles[size],
    widthStyles[width],
    className
  )

  if (asChild && isValidElement(children)) {
    const child = children
    const isLink = child.type === 'a' || (typeof child.type === 'object' && (child.type.displayName === 'Link' || child.type.name === 'Link'))
    const isButton = child.type === 'button'
    const childProps = {
      ...child.props,
      className: cn(child.props.className, buttonClasses),
      'aria-disabled': isDisabled,
      ref,
    }
    if (isLink || isButton) {
      childProps.onClick = (e) => {
        if (isDisabled) {
          e.preventDefault()
          return
        }
        child.props.onClick?.(e)
      }
    }
    if (isButton) {
      childProps.disabled = isDisabled
    }
    return cloneElement(child, childProps, child.props.children)
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
      ) : null}
      <span className="truncate">{children}</span>
      {!loading && iconRight ? (
        <span className="flex-shrink-0" aria-hidden="true">{iconRight}</span>
      ) : null}
    </button>
  )
})

Button.displayName = 'Button'