import { forwardRef, useId, useState, useEffect } from 'react'
import { cn } from '../utils/helpers'

export const Input = forwardRef(function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
  floatingLabel = true,
  className = '',
  id: providedId,
  type = 'text',
  value,
  defaultValue,
  onChange,
  ...props
}, ref) {
  const generatedId = useId()
  const id = providedId || generatedId
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const [hasValue, setHasValue] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const val = value !== undefined ? value : defaultValue
    setHasValue(val !== undefined && val !== '')
  }, [value, defaultValue])

  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium transition-all duration-fast',
            floatingLabel
              ? 'text-[var(--text-muted)] group-focus-within:text-white'
              : 'text-[var(--text)] mb-1.5'
          )}
        >
          {label}
          {props.required && <span className="text-[var(--error)] ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div
            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-subtle)] transition-colors duration-fast group-focus-within:text-white"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={cn(
            'w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-subtle)]',
            'rounded-xl transition-all duration-fast ease-out-expo',
            'focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent focus:ring-offset-2 focus:ring-offset-bg',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'placeholder:text-[var(--text-subtle)]',
            floatingLabel
              ? 'pt-5 pb-1.5 pl-10 pr-10 sm:pt-6 sm:pb-2'
              : 'py-2.5 pl-10 pr-10 sm:py-3',
            icon && !floatingLabel ? 'pl-10' : '',
            iconRight && 'pr-10',
            error && 'border-[var(--error)] focus:ring-[var(--error)]',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => {
            setHasValue(e.target.value !== '')
            onChange?.(e)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {iconRight && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-subtle)]"
            aria-hidden="true"
          >
            {iconRight}
          </div>
        )}
        {floatingLabel && label && (
          <span
            className={cn(
              'absolute inset-y-0 left-0 pl-10 pointer-events-none',
              'transition-all duration-fast ease-out-expo',
              'text-[var(--text-muted)]',
              !hasValue && !isFocused
                ? 'top-1/2 -translate-y-1/2 text-base text-[var(--text-subtle)]'
                : 'top-1.5 text-xs text-white'
            )}
            aria-hidden="true"
          >
            {label}
          </span>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-sm text-[var(--error)] flex items-center gap-1 animate-fade-in"
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-[var(--text-subtle)]">
          {hint}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'