import { cn } from '@/utils/cn'

const variantClasses = {
  default:
    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  primary:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  danger:
    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

/**
 * Etiqueta de estado o categoría.
 *
 * @param {'default'|'primary'|'success'|'warning'|'danger'} variant
 */
export default function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant] ?? variantClasses.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
