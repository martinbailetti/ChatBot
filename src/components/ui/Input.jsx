import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

/**
 * Campo de texto reutilizable con soporte para etiqueta, error y descripción.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    id,
    className,
    containerClassName,
    as: Tag = 'input',
    ...props
  },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <Tag
        ref={ref}
        id={inputId}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm',
          'bg-white text-slate-900 placeholder-slate-400',
          'border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
          'transition-colors duration-150',
          'dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500',
          'dark:border-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p
          id={`${inputId}-hint`}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          {hint}
        </p>
      )}
    </div>
  )
})

export default Input
