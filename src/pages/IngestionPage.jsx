import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, AlertCircle, Play, CheckCircle2, XCircle, Activity } from 'lucide-react'
import { authFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'
import useAuthStore from '@/store/useAuthStore'

function StatusBadge({ online }) {
  return online ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Online
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
      <XCircle className="h-3.5 w-3.5" />
      Offline
    </span>
  )
}

export default function IngestionPage() {
  const { t }   = useTranslation()
  const user    = useAuthStore((s) => s.user)
  const isAdmin = user?.type === 'ADMIN'

  const [status, setStatus]     = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [pending, setPending]   = useState(null)
  const [loadingPending, setLoadingPending] = useState(false)
  const [syncing, setSyncing]   = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [error, setError]       = useState(null)

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true)
    setError(null)
    try {
      const res = await authFetch('/api/ingestion/status')
      setStatus(res.data ?? null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingStatus(false)
    }
  }, [])

  const loadPending = useCallback(async () => {
    if (!isAdmin) {
      setPending(null)
      return
    }
    setLoadingPending(true)
    setError(null)
    try {
      const res = await authFetch('/api/ingestion/pending')
      setPending(res.data ?? null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingPending(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadStatus()
    loadPending()
  }, [loadStatus, loadPending])

  async function handleSync() {
    if (!window.confirm(t('ingestion.confirmSync'))) return
    setSyncing(true)
    setSyncResult(null)
    setError(null)
    try {
      const res = await authFetch('/api/ingestion/sync', { method: 'POST' })
      setSyncResult(res)
      // Refrescar estado después del sync
      await loadStatus()
      await loadPending()
    } catch (err) {
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="page-container py-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('ingestion.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('ingestion.subtitle')}
          </p>
        </div>
        <button
          onClick={async function () {
            await loadStatus()
            await loadPending()
          }}
          disabled={loadingStatus || loadingPending}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', (loadingStatus || loadingPending) && 'animate-spin')} />
          {t('common.refresh')}
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Card de estado */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950">
              <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{t('ingestion.serviceStatus')}</p>
              <p className="text-xs text-slate-400">{t('ingestion.serviceStatusDesc')}</p>
            </div>
          </div>
          {loadingStatus ? (
            <span className="text-sm text-slate-400">{t('common.loading')}</span>
          ) : (
            <StatusBadge online={status?.online === true} />
          )}
        </div>

        {status?.info && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <pre className="whitespace-pre-wrap">{JSON.stringify(status.info, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Botón de sincronización */}
      {isAdmin && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
            {t('ingestion.syncTitle')}
          </h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {t('ingestion.syncDesc')}
          </p>

          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t('ingestion.pendingTitle')}
              </p>
              {loadingPending ? (
                <span className="text-xs text-slate-400">{t('common.loading')}</span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('ingestion.pendingSummary', {
                    nuevos: Array.isArray(pending?.nuevos) ? pending.nuevos.length : 0,
                    modificados: Array.isArray(pending?.modificados) ? pending.modificados.length : 0,
                  })}
                </span>
              )}
            </div>

            {!loadingPending && (
              <>
                {Array.isArray(pending?.nuevos) && pending.nuevos.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      {t('ingestion.pendingNew')}
                    </p>
                    <ul className="max-h-40 overflow-auto space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {pending.nuevos.map(function (doc) {
                        const key = doc.ruta || doc.nombre
                        return (
                          <li key={key} className="rounded bg-white px-2 py-1 dark:bg-slate-900">
                            <span className="font-medium">{doc.nombre || t('documents.noRuta')}</span>
                            {doc.ruta && <span className="ml-2 text-slate-400">{doc.ruta}</span>}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {Array.isArray(pending?.modificados) && pending.modificados.length > 0 && (
                  <div className="mb-2">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                      {t('ingestion.pendingModified')}
                    </p>
                    <ul className="max-h-40 overflow-auto space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {pending.modificados.map(function (doc) {
                        const key = doc.ruta || doc.nombre
                        return (
                          <li key={key} className="rounded bg-white px-2 py-1 dark:bg-slate-900">
                            <span className="font-medium">{doc.nombre || t('documents.noRuta')}</span>
                            {doc.ruta && <span className="ml-2 text-slate-400">{doc.ruta}</span>}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {(!Array.isArray(pending?.nuevos) || pending.nuevos.length === 0)
                  && (!Array.isArray(pending?.modificados) || pending.modificados.length === 0) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('ingestion.pendingEmpty')}</p>
                  )}
              </>
            )}
          </div>

          <button
            onClick={handleSync}
            disabled={syncing || !status?.online}
            className={cn(
              'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
              'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:bg-indigo-500 dark:hover:bg-indigo-600'
            )}
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {syncing ? t('ingestion.syncing') : t('ingestion.syncButton')}
          </button>

          {syncResult && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <p className="font-medium">{t('ingestion.syncSuccess')}</p>
              {syncResult.message && <p className="mt-1 text-xs">{syncResult.message}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
