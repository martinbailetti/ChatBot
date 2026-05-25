import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { RefreshCw, Bot, User, AlertCircle, X, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { authFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
}

function truncate(text, max = 80) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '…' : text
}

function RoleBadge({ role }) {
  const { t } = useTranslation()
  const isUser = role === 'user'
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
      isUser
        ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
    )}>
      {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
      {isUser ? t('messages.roleUser') : t('messages.roleAssistant')}
    </span>
  )
}

function FoundBadge({ found, role }) {
  const { t } = useTranslation()
  if (role !== 'assistant') return null
  if (found === null || found === undefined) return <span className="text-xs text-slate-400">—</span>
  const ok = found === true || found === 1 || found === '1'
  return (
    <span className={cn(
      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
      ok
        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
    )}>
      {ok ? t('messages.found') : t('messages.notFound')}
    </span>
  )
}

function DetailPanel({ msg, onClose }) {
  const { t } = useTranslation()
  if (!msg) return null

  let extra = null
  try { extra = typeof msg.extra === 'string' ? JSON.parse(msg.extra) : (msg.extra ?? null) } catch (_) {}
  const sources = extra?.sources ?? []

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('messages.detailTitle')}</span>
        <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">{t('messages.fieldRole')}</dt>
          <dd><RoleBadge role={msg.role} /></dd>

          <dt className="text-slate-500 dark:text-slate-400">{t('messages.fieldConversation')}</dt>
          <dd className="truncate text-slate-900 dark:text-slate-100" title={msg.conversation_title}>
            {msg.conversation_title || `#${msg.conversation_id}`}
          </dd>

          <dt className="text-slate-500 dark:text-slate-400">{t('messages.fieldUser')}</dt>
          <dd className="truncate text-slate-900 dark:text-slate-100">{msg.user_email || '—'}</dd>

          <dt className="text-slate-500 dark:text-slate-400">{t('messages.fieldDate')}</dt>
          <dd className="text-slate-900 dark:text-slate-100">{formatDate(msg.created_at)}</dd>

          {msg.role === 'assistant' && (
            <>
              <dt className="text-slate-500 dark:text-slate-400">{t('messages.fieldFound')}</dt>
              <dd><FoundBadge found={msg.found} role={msg.role} /></dd>
            </>
          )}

          {msg.model && (
            <>
              <dt className="text-slate-500 dark:text-slate-400">{t('messages.fieldModel')}</dt>
              <dd className="text-xs font-mono text-slate-900 dark:text-slate-100">{msg.model}</dd>
            </>
          )}

          {(msg.prompt_token_count != null || msg.total_token_count != null) && (
            <>
              <dt className="text-slate-500 dark:text-slate-400">{t('messages.fieldTokens')}</dt>
              <dd className="text-xs text-slate-900 dark:text-slate-100 space-x-2">
                {msg.prompt_token_count != null && <span title="prompt">↑{msg.prompt_token_count}</span>}
                {msg.candidates_token_count != null && <span title="candidatos">↓{msg.candidates_token_count}</span>}
                {msg.total_token_count != null && <span className="font-semibold">={msg.total_token_count}</span>}
              </dd>
            </>
          )}

          {msg.status && msg.status !== 'DEFAULT' && (
            <>
              <dt className="text-slate-500 dark:text-slate-400">{t('messages.fieldStatus')}</dt>
              <dd className="font-mono text-xs text-slate-900 dark:text-slate-100">{msg.status}</dd>
            </>
          )}

          {msg.status_info && (
            <>
              <dt className="text-slate-500 dark:text-slate-400">{t('messages.fieldStatusInfo')}</dt>
              <dd className="text-xs text-slate-700 dark:text-slate-300">{msg.status_info}</dd>
            </>
          )}
        </dl>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">{t('messages.fieldContent')}</p>
          {msg.role === 'assistant' ? (
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100">
              {msg.content}
            </p>
          )}
        </div>

        {sources.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">{t('messages.fieldSources')}</p>
            <ul className="space-y-1">
              {sources.map((s, i) => (
                <li key={i} className="truncate rounded bg-slate-50 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300" title={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [messages,    setMessages]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [selected,    setSelected]    = useState(null)
  const [filterConv,  setFilterConv]  = useState(() => searchParams.get('id') ?? '')
  const [filterUser,  setFilterUser]  = useState('')
  const [filterRole,  setFilterRole]  = useState('')
  const [sortCol,     setSortCol]     = useState('created_at')
  const [sortDir,     setSortDir]     = useState('asc')

  // Limpia el query param de la URL sin afectar el filtro activo
  useEffect(() => {
    if (searchParams.has('id')) {
      setSearchParams({}, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch('/api/chat/messages')
      if (res.success && Array.isArray(res.data)) setMessages(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const convOptions = useMemo(() => {
    const map = new Map()
    messages.forEach(m => {
      if (m.conversation_id) map.set(String(m.conversation_id), m.conversation_title || `#${m.conversation_id}`)
    })
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [messages])

  const userOptions = useMemo(() => {
    const set = new Set(messages.map(m => m.user_email).filter(Boolean))
    return [...set].sort()
  }, [messages])

  const filtered = useMemo(() => messages.filter(m => {
    if (filterConv && String(m.conversation_id) !== filterConv) return false
    if (filterUser && m.user_email !== filterUser) return false
    if (filterRole && m.role !== filterRole) return false
    return true
  }), [messages, filterConv, filterUser, filterRole])

  const sorted = useMemo(() => {
    const cmp = (a, b) => {
      let va = a[sortCol] ?? ''
      let vb = b[sortCol] ?? ''
      if (sortCol === 'id') return Number(va) - Number(vb)
      if (sortCol === 'found') {
        va = va === true || va === 1 || va === '1' ? 1 : 0
        vb = vb === true || vb === 1 || vb === '1' ? 1 : 0
        return va - vb
      }
      return String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' })
    }
    return [...filtered].sort((a, b) => sortDir === 'asc' ? cmp(a, b) : cmp(b, a))
  }, [filtered, sortCol, sortDir])

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 inline h-3 w-3 text-indigo-500" />
      : <ArrowDown className="ml-1 inline h-3 w-3 text-indigo-500" />
  }

  const selectMsg = (msg) => setSelected(prev => prev?.id === msg.id ? null : msg)

  const resetFilters = () => { setFilterConv(''); setFilterUser(''); setFilterRole(''); setSelected(null) }

  return (
    <div className="page-container py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('messages.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('messages.subtitle', { count: filtered.length })}
          </p>
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

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={filterConv}
          onChange={e => { setFilterConv(e.target.value); setSelected(null) }}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="">{t('messages.allConversations')}</option>
          {convOptions.map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>

        <select
          value={filterUser}
          onChange={e => { setFilterUser(e.target.value); setSelected(null) }}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="">{t('messages.allUsers')}</option>
          {userOptions.map(email => (
            <option key={email} value={email}>{email}</option>
          ))}
        </select>

        <select
          value={filterRole}
          onChange={e => { setFilterRole(e.target.value); setSelected(null) }}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="">{t('messages.allRoles')}</option>
          <option value="user">{t('messages.roleUser')}</option>
          <option value="assistant">{t('messages.roleAssistant')}</option>
        </select>

        {(filterConv || filterUser || filterRole) && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="h-3.5 w-3.5" />
            {t('common.clearFilters')}
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className={cn('flex gap-4', selected ? 'flex-col lg:flex-row' : '')}>
        <div className={cn(
          'min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
          selected ? 'lg:flex-1' : 'w-full'
        )}>
          {loading ? (
            <div className="py-16 text-center text-slate-400">{t('common.loading')}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">{t('messages.empty')}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {[
                    { col: 'id',                 label: t('messages.colId') },
                    { col: 'role',               label: t('messages.colRole') },
                    { col: 'content',            label: t('messages.colContent') },
                    ...(!selected ? [{ col: 'conversation_title', label: t('messages.colConversation') }] : []),
                    ...(!selected ? [{ col: 'user_email',         label: t('messages.colUser') }] : []),
                    { col: 'found',              label: t('messages.colFound') },
                    { col: 'created_at',         label: t('messages.colDate') },
                  ].map(({ col, label }) => (
                    <th
                      key={col}
                      onClick={() => toggleSort(col)}
                      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      {label}<SortIcon col={col} />
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => selectMsg(msg)}
                    className={cn(
                      'cursor-pointer border-b border-slate-100 last:border-0 dark:border-slate-800 transition-colors',
                      selected?.id === msg.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <td className="px-4 py-2.5 text-xs text-slate-400">#{msg.id}</td>
                    <td className="px-4 py-2.5"><RoleBadge role={msg.role} /></td>
                    <td className="px-4 py-2.5 max-w-xs text-slate-700 dark:text-slate-300">
                      {truncate(msg.content, selected ? 50 : 80)}
                    </td>
                    {!selected && (
                      <td className="px-4 py-2.5 max-w-[160px] truncate text-slate-600 dark:text-slate-400" title={msg.conversation_title}>
                        {msg.conversation_title || `#${msg.conversation_id}`}
                      </td>
                    )}
                    {!selected && (
                      <td className="px-4 py-2.5 text-xs text-slate-500">{msg.user_email || '—'}</td>
                    )}
                    <td className="px-4 py-2.5"><FoundBadge found={msg.found} role={msg.role} /></td>
                    <td className="px-4 py-2.5 text-xs text-slate-400 whitespace-nowrap">{formatDate(msg.created_at)}</td>
                    <td className="px-2 py-2.5">
                      <ChevronRight className={cn('h-4 w-4 text-slate-300 transition-transform', selected?.id === msg.id && 'rotate-90 text-indigo-500')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="lg:w-96 shrink-0">
            <DetailPanel msg={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </div>
  )
}

