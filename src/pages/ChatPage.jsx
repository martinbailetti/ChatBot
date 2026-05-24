import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, MessageSquare, Trash2, ExternalLink, AlertCircle, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authFetch, authFetchRaw } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

let _msgCounter = 0
function newId() {
  return `msg-${++_msgCounter}-${Date.now()}`
}

/** Convierte un mensaje de la API (rol/content/extra) al formato interno */
function mapApiMessage(m) {
  let extra = null
  try { extra = typeof m.extra === 'string' ? JSON.parse(m.extra) : (m.extra ?? null) } catch (_) {}
  const ts = m.created_at
    ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : getNow()
  return {
    id: String(m.id),
    sender: m.role === 'user' ? 'user' : 'bot',
    text: typeof m.content === 'string' ? m.content : (m.content != null ? JSON.stringify(m.content) : ''),
    sources: extra?.sources ?? [],
    allSources: extra?.all_sources ?? false,
    needsClarification: extra?.needs_clarification ?? false,
    time: ts,
  }
}

// â”€â”€ Componente: burbuja del bot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function parseSrcPath(src) {
  if (typeof src !== 'string') return null
  const idx = src.indexOf(' (fragmento:')
  return idx >= 0 ? src.slice(0, idx).trim() : src.trim()
}

function parseSrcLabel(src) {
  if (typeof src !== 'string') return src?.label ?? src?.url ?? ''
  const idx = src.indexOf(' (fragmento:')
  const filePath = idx >= 0 ? src.slice(0, idx).trim() : src.trim()
  const fileName = filePath.replace(/\\/g, '/').split('/').pop() ?? filePath
  if (idx < 0) return fileName
  const fragment = src.slice(idx + 12, idx + 80).replace(/\.\.\.?$/, '').trim()
  return fileName + ' — ' + fragment + '…'
}

async function downloadDoc(ruta) {
  try {
    const response = await authFetchRaw(`/api/documents/file?ruta=${encodeURIComponent(ruta)}`)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // Intentar extraer nombre del header Content-Disposition
    const cd = response.headers.get('content-disposition') ?? ''
    const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n]+)/i)
    a.download = match ? decodeURIComponent(match[1]) : ruta.replace(/\\/g, '/').split('/').pop()
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('[downloadDoc]', err)
    alert('No se pudo descargar el documento.')
  }
}

function BotBubble({ text, sources, allSources, needsClarification }) {
  const visibleSources = allSources ? sources : sources?.slice(0, 3)
  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn(
        'prose prose-sm dark:prose-invert max-w-none rounded-2xl rounded-tl-sm px-4 py-3',
        'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
        needsClarification && 'border border-amber-300 dark:border-amber-700'
      )}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
      {visibleSources?.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-1">
          {visibleSources.map((src, i) => {
            const path = typeof src === 'string' ? parseSrcPath(src) : (src?.url ?? null)
            const label = parseSrcLabel(src)
            return (
              <button
                key={i}
                type="button"
                onClick={() => path && downloadDoc(path)}
                title={typeof src === 'string' ? src : label}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors duration-150 cursor-pointer"
              >
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// â”€â”€ Componente: indicador de escritura â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800 w-16">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

// â”€â”€ PÃ¡gina principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ChatPage() {
  const { t } = useTranslation()
  const { user } = useAuth()  // eslint-disable-line no-unused-vars

  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId]       = useState(null)
  const [msgCache, setMsgCache]           = useState({})       // convId â†’ Message[]
  const [loadingConvs, setLoadingConvs]   = useState(true)
  const [loadingMsgs, setLoadingMsgs]     = useState(false)
  const [sidebarOpen, setSidebarOpen]     = useState(() => window.innerWidth >= 768)
  const [prompt, setPrompt]               = useState('')
  const [sending, setSending]             = useState(false)
  const [error, setError]                 = useState(null)

  const bottomRef   = useRef(null)
  const textareaRef = useRef(null)
  const isMounted   = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  // Auto-scroll al Ãºltimo mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgCache, selectedId, sending])

  // â”€â”€ Cargar mensajes de una conversaciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadMessages = useCallback(async (convId) => {
    if (!isMounted.current) return
    setLoadingMsgs(true)
    try {
      const res = await authFetch(`/api/chat/conversations/${convId}/messages`)
      if (!isMounted.current) return
      const apiMsgs = Array.isArray(res.data?.messages) ? res.data.messages : []
      setMsgCache(prev => ({ ...prev, [convId]: apiMsgs.map(mapApiMessage) }))
      if (res.data?.conversation) {
        const conv = res.data.conversation
        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, title: conv.title } : c))
      }
    } catch (err) {
      console.error('Error loading messages', err)
    } finally {
      if (isMounted.current) setLoadingMsgs(false)
    }
  }, [])

  // â”€â”€ Cargar conversaciones al montar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingConvs(true)
      try {
        const res = await authFetch('/api/chat/conversations')
        if (cancelled) return
        const convs = Array.isArray(res.data) ? res.data : []
        setConversations(convs)
        if (convs.length > 0) {
          setSelectedId(convs[0].id)
          await loadMessages(convs[0].id)
        }
      } catch (err) {
        console.error('Error loading conversations', err)
      } finally {
        if (!cancelled) setLoadingConvs(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [loadMessages])

  // â”€â”€ Seleccionar conversaciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function handleSelect(id) {
    if (id === selectedId) return
    setSelectedId(id)
    setError(null)
    if (!msgCache[id]) loadMessages(id)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  // â”€â”€ Nueva conversaciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleNew() {
    try {
      const res = await authFetch('/api/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: t('chat.newConversation') }),
      })
      const conv = res.data
      if (!conv?.id) return
      setConversations(prev => [conv, ...prev])
      setMsgCache(prev => ({ ...prev, [conv.id]: [] }))
      setSelectedId(conv.id)
      setError(null)
      if (window.innerWidth < 768) setSidebarOpen(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    } catch (err) {
      console.error('Error creating conversation', err)
    }
  }

  // â”€â”€ Eliminar conversaciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleDelete(e, convId) {
    e.stopPropagation()
    if (!window.confirm(t('conversations.confirmDelete'))) return
    try {
      await authFetch(`/api/chat/conversations/${convId}`, { method: 'DELETE' })
      const remaining = conversations.filter(c => c.id !== convId)
      setConversations(remaining)
      setMsgCache(prev => { const n = { ...prev }; delete n[convId]; return n })
      if (selectedId === convId) {
        const next = remaining[0]?.id ?? null
        setSelectedId(next)
        if (next && !msgCache[next]) loadMessages(next)
      }
    } catch (err) {
      console.error('Error deleting conversation', err)
    }
  }

  // â”€â”€ Construir historial para el contexto del LLM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const buildConversation = useCallback((msgs) => {
    const MAX_CHARS = 4000
    const pairs = []
    let chars = 0
    for (let i = msgs.length - 1; i >= 0; i--) {
      const content = msgs[i].text ?? ''
      chars += content.length
      if (chars > MAX_CHARS) break
      pairs.unshift({ role: msgs[i].sender === 'user' ? 'user' : 'assistant', content })
    }
    return pairs
  }, [])

  // â”€â”€ Enviar mensaje â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function sendMessage() {
    const text = prompt.trim()
    if (!text || sending) return

    const userMsg = { id: newId(), sender: 'user', text, sources: [], allSources: false, needsClarification: false, time: getNow() }

    // Crear conversaciÃ³n si no hay ninguna seleccionada
    let convId = selectedId
    if (!convId) {
      try {
        const res = await authFetch('/api/chat/conversations', {
          method: 'POST',
          body: JSON.stringify({ title: text.slice(0, 60) }),
        })
        const conv = res.data
        if (!conv?.id) return
        setConversations(prev => [conv, ...prev])
        setMsgCache(prev => ({ ...prev, [conv.id]: [] }))
        setSelectedId(conv.id)
        convId = conv.id
      } catch {
        setError(t('chat.errorNetwork'))
        return
      }
    }

    const currentMsgs = msgCache[convId] ?? []
    const nextMsgs = [...currentMsgs, userMsg]
    setMsgCache(prev => ({ ...prev, [convId]: nextMsgs }))
    setPrompt('')
    setSending(true)
    setError(null)

    try {
      const res = await authFetch('/api/chat/query', {
        method: 'POST',
        body: JSON.stringify({
          pregunta:        text,
          conversation:    buildConversation(nextMsgs),
          conversation_id: convId,
        }),
      })
      const d = res.data ?? res

      // El servidor puede haber asignado/cambiado el conversation_id
      const serverConvId = d.conversation_id ?? convId
      if (serverConvId !== convId) {
        setSelectedId(serverConvId)
        convId = serverConvId
      }

      const botMsg = {
        id: newId(),
        sender: 'bot',
        text: d.text ?? t('chat.errorEmpty'),
        sources: d.sources ?? [],
        allSources: d.all_sources ?? false,
        needsClarification: d.needs_clarification ?? false,
        time: getNow(),
      }
      setMsgCache(prev => ({ ...prev, [convId]: [...(prev[convId] ?? nextMsgs), botMsg] }))
      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, updated_at: new Date().toISOString() } : c
      ))

      // Auto-renombrar si todavÃ­a tiene el tÃ­tulo por defecto
      const conv = conversations.find(c => c.id === convId)
      if (conv && (conv.title === t('chat.newConversation') || !conv.title)) {
        const newTitle = text.slice(0, 60)
        setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: newTitle } : c))
        authFetch(`/api/chat/conversations/${convId}/title`, {
          method: 'PATCH',
          body: JSON.stringify({ title: newTitle }),
        }).catch(() => {})
      }
    } catch (err) {
      let message = t('chat.errorNetwork')
      try {
        const parsed = JSON.parse(err.message.replace(/^API error \d+: /, ''))
        message = parsed.message ?? message
      } catch (_) {}
      setError(message)
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const activeMessages = msgCache[selectedId] ?? []
  const isEmpty = activeMessages.length === 0
  const activeTitle = conversations.find(c => c.id === selectedId)?.title ?? t('chat.title')

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="flex" style={{ height: 'calc(100dvh - 3.5rem)' }}>

      {/* Backdrop mÃ³vil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar de conversaciones */}
      <aside className={cn(
        'fixed top-14 left-0 z-30 flex flex-col w-64',
        'h-[calc(100dvh-3.5rem)]',
        'border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900',
        'transition-transform duration-200 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:static md:top-auto md:left-auto md:z-auto md:translate-x-0 md:h-full md:shrink-0',
      )}>
        {/* Cabecera sidebar */}
        <div className="flex shrink-0 items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('chat.conversations')}
          </span>
          <button
            onClick={handleNew}
            title={t('chat.newConversation')}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto py-1">
          {loadingConvs && (
            <p className="px-4 py-3 text-xs text-slate-400">{t('common.loading')}</p>
          )}
          {!loadingConvs && conversations.length === 0 && (
            <p className="px-4 py-3 text-xs text-slate-400">{t('chat.noConversations')}</p>
          )}
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className={cn(
                'group w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors',
                'hover:bg-slate-200 dark:hover:bg-slate-800',
                conv.id === selectedId
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-300'
              )}
            >
              <span className="flex-1 truncate">{conv.title || t('conversations.untitled')}</span>
              <span
                role="button"
                onClick={(e) => handleDelete(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Ãrea de chat */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Cabecera */}
        <div className="shrink-0 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          {/* Toggle sidebar (mÃ³vil) */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
            aria-label={t('chat.conversations')}
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
            <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{activeTitle}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('chat.subtitle')}</p>
          </div>
        </div>

        {/* Panel de mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-white dark:bg-slate-950">
          {isEmpty && !sending && !loadingMsgs && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-slate-400 dark:text-slate-500 select-none">
              <MessageSquare className="h-12 w-12 opacity-20" aria-hidden="true" />
              <p className="text-sm font-medium">{t('chat.empty')}</p>
              <p className="text-xs">{t('chat.emptyHint')}</p>
            </div>
          )}

          {loadingMsgs && (
            <div className="flex justify-center py-8">
              <span className="text-xs text-slate-400">{t('common.loading')}</span>
            </div>
          )}

          {!loadingMsgs && activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-2', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.sender === 'user' ? (
                <div className="flex flex-col items-end gap-1 max-w-[80%]">
                  <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm text-white dark:bg-indigo-500 whitespace-pre-wrap">
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{msg.time}</span>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-1 max-w-[85%]">
                  <BotBubble
                    text={msg.text}
                    sources={msg.sources}
                    allSources={msg.allSources}
                    needsClarification={msg.needsClarification}
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 pl-1">{msg.time}</span>
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <div className={cn(
            'flex items-end gap-2 rounded-xl border bg-white px-3 py-2',
            'border-slate-300 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400',
            'dark:border-slate-600 dark:bg-slate-800 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500',
            'transition-shadow duration-150'
          )}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              placeholder={t('chat.placeholder')}
              className={cn(
                'flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder-slate-400',
                'dark:text-slate-100 dark:placeholder-slate-500',
                'focus:outline-none',
                'max-h-40 min-h-[1.5rem]',
                'disabled:opacity-50'
              )}
              style={{ fieldSizing: 'content' }}
              aria-label={t('chat.placeholder')}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !prompt.trim()}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                'bg-indigo-600 text-white hover:bg-indigo-700',
                'dark:bg-indigo-500 dark:hover:bg-indigo-600',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
              )}
              aria-label={t('chat.send')}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-500">
            {t('chat.hint')}
          </p>
        </div>
      </div>
    </div>
  )
}
