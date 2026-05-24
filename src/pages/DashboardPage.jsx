import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut, User, RefreshCw, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card, Button, Badge } from '@/components/ui'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout, refreshMe } = useAuth()

  // Actualizar datos del usuario al montar la página
  useEffect(() => {
    if (isAuthenticated) {
      refreshMe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : '—'

  return (
    <main className="page-container py-10">
      {/* Cabecera */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('auth.welcome')},{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {fullName}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshMe}
            title={t('dashboard.refresh')}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span className="ml-1.5">{t('dashboard.refresh')}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="ml-1.5">{t('auth.logout')}</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Perfil */}
        <Card className="col-span-full sm:col-span-2 lg:col-span-1">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t('dashboard.profileCard')}
              </h2>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">{t('auth.email')}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[12rem]">
                  {user?.email ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">{t('dashboard.firstName')}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">
                  {user?.first_name ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">{t('dashboard.lastName')}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">
                  {user?.last_name ?? '—'}
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        {/* Sesión activa */}
        <Card>
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {t('dashboard.sessionCard')}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">{t('dashboard.sessionActive')}</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {t('dashboard.sessionDesc')}
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
