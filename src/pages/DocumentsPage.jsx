import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FileText, Trash2, ChevronRight, AlertCircle, RefreshCw, Search } from 'lucide-react'
import { authFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'
import useAuthStore from '@/store/useAuthStore'

export default function DocumentsPage() {
  const { t }      = useTranslation()
  const user       = useAuthStore((s) => s.user)
  const isAdmin    = user?.type === 'ADMIN'

  const [documents, setDocuments] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [deleting, setDeleting]   = useState(null)
  const [filter, setFilter]       = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch('/api/documents')
      const list = res.data?.documentos ?? res.data
      setDocuments(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(ruta) {
    if (!window.confirm(t('documents.confirmDelete'))) return
    setDeleting(ruta)
    try {
      await authFetch(`/api/documents?ruta=${encodeURIComponent(ruta)}`, { method: 'DELETE' })
      setDocuments((prev) => prev.filter((d) => d.ruta !== ruta))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  const filtered = filter.trim()
    ? documents.filter(
        (d) =>
          (d.nombre ?? d.ruta ?? '').toLowerCase().includes(filter.toLowerCase()) ||
          (d.carpeta ?? '').toLowerCase().includes(filter.toLowerCase())
      )
    : documents

  return (
    <div className="page-container py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('documents.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('documents.subtitle', { count: filtered.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('common.search')}
              className="h-8 rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex h-8 items-center gap-1.5 rounded-md px-3 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400">{t('common.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <FileText className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p>{t('documents.empty')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">{t('documents.colName')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300 hidden md:table-cell">{t('documents.colFolder')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300 hidden sm:table-cell">{t('documents.colChunks')}</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => {
                const name = doc.nombre ?? doc.ruta ?? '—'
                return (
                  <tr
                    key={doc.ruta ?? i}
                    className={cn(
                      'border-b border-slate-100 last:border-0 dark:border-slate-800',
                      i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/50'
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {doc.carpeta ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {doc.chunks ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/documentos/detalle?ruta=${encodeURIComponent(doc.ruta)}`}
                          className="rounded p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title={t('documents.viewDetail')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(doc.ruta)}
                            disabled={deleting === doc.ruta}
                            className="rounded p-1 text-slate-400 hover:text-red-600 disabled:opacity-40 dark:hover:text-red-400"
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
