import { cn } from '@/utils/cn'

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
}

/**
 * Indicador de carga circular.
 *
 * @param {'sm'|'md'|'lg'} size
 * @param {string} className
 * @param {string} label - Texto accesible para lectores de pantalla
 */
export default function Spinner({ size = 'md', className, label = 'Cargando...' }) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <span
        className={cn(
          'inline-block animate-spin rounded-full',
          'border-slate-200 border-t-indigo-600',
          'dark:border-slate-700 dark:border-t-indigo-400',
          sizeClasses[size] ?? sizeClasses.md,
          className
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
