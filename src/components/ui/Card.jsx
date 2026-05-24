import { cn } from '@/utils/cn'

/**
 * Tarjeta contenedora reutilizable.
 * Acepta subcomponentes: Card.Header, Card.Body, Card.Footer.
 */
export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white shadow-sm',
        'dark:border-slate-700 dark:bg-slate-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'border-b border-slate-200 px-5 py-4 dark:border-slate-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Body = function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'border-t border-slate-200 px-5 py-3 dark:border-slate-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
