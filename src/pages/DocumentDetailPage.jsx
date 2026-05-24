import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle, RefreshCw, FileText } from 'lucide-react'
import { authFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'

export default function DocumentDetailPage() {
  const { t }          = useTranslation()
  const [searchParams] = useSearchParams()
  const ruta           = searchParams.get('ruta')

  const [detail, setDetail]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    if (!ruta) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch(`/api/documents/detail?ruta=${encodeURIComponent(ruta)}`)
      setDetail(res.data ?? null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [ruta])

  useEffect(() => { load() }, [load])

  if (!ruta) {
    return (
      <div className="page-container py-8">
        <p className="text-slate-500">{t('documents.noRuta')}</p>
        <Link to="/documentos" className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('documents.title')}
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/documentos"
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900 dark:text-slate-100">
            {detail?.nombre ?? decodeURIComponent(ruta)}
          </h1>
          {detail?.carpeta && (
            <p className="text-xs text-slate-400">{detail.carpeta}</p>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400">{t('common.loading')}</div>
      ) : !detail ? (
        <div className="py-16 text-center text-slate-400">
          <FileText className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p>{t('documents.detailNotFound')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Metadatos */}
          <div className="flex flex-wrap gap-3">
            {detail.chunks && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {t('documents.colChunks')}: {detail.chunks}
              </span>
            )}
            {detail.pages && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {t('documents.pages')}: {detail.pages}
              </span>
            )}
          </div>

          {/* Contenido de los chunks */}
          {Array.isArray(detail.chunks_content) && detail.chunks_content.length > 0 ? (
            <div className="space-y-3">
              {detail.chunks_content.map((chunk, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      {t('documents.chunk')} {i + 1}
                      {chunk.page != null && ` · ${t('documents.page')} ${chunk.page}`}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
                    {typeof chunk === 'string' ? chunk : chunk.content ?? JSON.stringify(chunk)}
                  </pre>
                </div>
              ))}
            </div>
          ) : detail.content ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
                {detail.content}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
