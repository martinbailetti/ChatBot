import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { MessageSquare, Trash2, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'
import { authFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
}

export default function ConversationsPage() {
  const { t } = useTranslation()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [deleting, setDeleting]           = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch('/api/chat/conversations')
      setConversations(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(id) {
    if (!window.confirm(t('conversations.confirmDelete'))) return
    setDeleting(id)
    try {
      await authFetch(`/api/chat/conversations/${id}`, { method: 'DELETE' })
      setConversations((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="page-container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('conversations.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('conversations.subtitle')}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium',
            'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
            'transition-colors duration-150 disabled:opacity-50'
          )}
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          {t('common.refresh')}
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 dark:text-slate-500">
          {t('common.loading')}
        </div>
      ) : conversations.length === 0 ? (
        <div className="py-16 text-center text-slate-400 dark:text-slate-500">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p>{t('conversations.empty')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">{t('conversations.colTitle')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300 hidden md:table-cell">{t('conversations.colUser')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300 hidden sm:table-cell">{t('conversations.colMessages')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300 hidden lg:table-cell">{t('conversations.colUpdated')}</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conv, i) => (
                <tr
                  key={conv.id}
                  className={cn(
                    'border-b border-slate-100 last:border-0 dark:border-slate-800',
                    i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/50'
                  )}
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/mensajes?id=${conv.id}`}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {conv.title || t('conversations.untitled')}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                    {conv.user_email ?? `#${conv.user_id}`}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                    {conv.message_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    {formatDate(conv.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/mensajes?id=${conv.id}`}
                        className="rounded p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title={t('conversations.viewMessages')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(conv.id)}
                        disabled={deleting === conv.id}
                        className="rounded p-1 text-slate-400 hover:text-red-600 disabled:opacity-40 dark:hover:text-red-400"
                        title={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
