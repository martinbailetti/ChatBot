import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="page-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-8xl font-bold text-slate-200 dark:text-slate-700 select-none" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-800 dark:text-slate-100">
        {t('notFound.title')}
      </h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        {t('notFound.desc')}
      </p>
      <Button
        as={Link}
        to="/"
        variant="primary"
        size="lg"
        className="mt-8"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        {t('notFound.back')}
      </Button>
    </main>
  )
}
