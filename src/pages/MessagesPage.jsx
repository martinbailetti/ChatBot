import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Bot, User, AlertCircle, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { authFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
}

export default function MessagesPage() {
  const { t }              = useTranslation()
  const [searchParams]     = useSearchParams()
  const convId             = searchParams.get('id')

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const load = useCallback(async () => {
    if (!convId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch(`/api/chat/conversations/${convId}/messages`)
      if (res.success && res.data) {
        setConversation(res.data.conversation ?? null)
        setMessages(Array.isArray(res.data.messages) ? res.data.messages : [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [convId])

  useEffect(() => { load() }, [load])

  if (!convId) {
    return (
      <div className="page-container py-8">
        <p className="text-slate-500">{t('messages.noConversation')}</p>
        <Link to="/conversaciones" className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('conversations.title')}
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/conversaciones"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {conversation?.title ?? t('conversations.untitled')}
            </h1>
            {conversation?.updated_at && (
              <p className="text-xs text-slate-400">{formatDate(conversation.updated_at)}</p>
            )}
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
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
        <div className="py-16 text-center text-slate-400">{t('common.loading')}</div>
      ) : messages.length === 0 ? (
        <div className="py-16 text-center text-slate-400">{t('messages.empty')}</div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                  <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              )}
              <div className={cn('max-w-[80%]', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                <div className={cn(
                  'rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-indigo-600 text-white dark:bg-indigo-500'
                    : 'rounded-tl-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 prose prose-sm dark:prose-invert max-w-none'
                )}>
                  {msg.role === 'user'
                    ? msg.content
                    : <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  }
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
                  {formatDate(msg.created_at)}
                  {msg.role === 'assistant' && msg.found === false && (
                    <span className="ml-2 text-amber-500">{t('messages.notFound')}</span>
                  )}
                </span>
              </div>
              {msg.role === 'user' && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
