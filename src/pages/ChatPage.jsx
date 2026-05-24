import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, MessageSquare, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'

// ── Helpers ────────────────────────────────────────────────────────────────────

function getNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

let _msgCounter = 0
function newId() {
  return `msg-${++_msgCounter}-${Date.now()}`
}

// ── Componente: burbuja de mensaje del bot ─────────────────────────────────────
function BotBubble({ text, sources, allSources, needsClarification }) {
  const { t } = useTranslation()
  const visibleSources = allSources ? sources : sources?.slice(0, 3)

  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'rounded-2xl rounded-tl-sm px-4 py-3',
        'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
        needsClarification && 'border border-amber-300 dark:border-amber-700'
      )}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
      {visibleSources && visibleSources.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-1">
          {visibleSources.map((src, i) => (
            <a
              key={i}
              href={typeof src === 'string' ? '#' : src.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
                'text-xs font-medium',
                'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900',
                'transition-colors duration-150'
              )}
            >
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
              {typeof src === 'string' ? src : (src.label ?? src.url)}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Componente: indicador de escritura ─────────────────────────────────────────
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

// ── Página principal ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  /** @type {[Array<{id,sender,text,sources,allSources,needsClarification,time}>, Function]} */
  const [messages, setMessages] = useState([])
  const [prompt, setPrompt]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [conversationId, setConversationId] = useState(null)

  const bottomRef   = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Construir historial conversacional para el API (últimos N intercambios)
  const buildConversation = useCallback((msgs) => {
    const MAX_CHARS = 4000
    const pairs = []
    let chars = 0

    // Recorremos de más reciente a más antiguo
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i]
      const role    = m.sender === 'user' ? 'user' : 'assistant'
      const content = m.text ?? ''
      chars += content.length
      if (chars > MAX_CHARS) break
      pairs.unshift({ role, content })
    }
    return pairs
  }, [])

  async function sendMessage() {
    const text = prompt.trim()
    if (!text || loading) return

    const userMsg = {
      id: newId(),
      sender: 'user',
      text,
      sources: [],
      allSources: false,
      needsClarification: false,
      time: getNow(),
    }

    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setPrompt('')
    setLoading(true)
    setError(null)

    try {
      const res = await authFetch('/api/chat/query', {
        method: 'POST',
        body: JSON.stringify({
          pregunta:         text,
          conversation:     buildConversation(nextMessages),
          ...(conversationId ? { conversation_id: conversationId } : {}),
        }),
      })

      const d = res.data ?? res
      if (d.conversation_id) setConversationId(d.conversation_id)
      const botMsg = {
        id: newId(),
        sender: 'bot',
        text: d.text ?? t('chat.errorEmpty'),
        sources: d.sources ?? [],
        allSources: d.all_sources ?? false,
        needsClarification: d.needs_clarification ?? false,
        time: getNow(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      let message = t('chat.errorNetwork')
      try {
        const parsed = JSON.parse(err.message.replace(/^API error \d+: /, ''))
        message = parsed.message ?? message
      } catch (_) {}
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleClear() {
    setMessages([])
    setError(null)
    setConversationId(null)
    textareaRef.current?.focus()
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 3.5rem)' }}>

      {/* Cabecera */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
            <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('chat.title')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('chat.subtitle')}</p>
          </div>
        </div>
        {!isEmpty && (
          <button
            onClick={handleClear}
            title={t('chat.clear')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium',
              'text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400',
              'transition-colors duration-150'
            )}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {t('chat.clear')}
          </button>
        )}
      </div>

      {/* Panel de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-white dark:bg-slate-950">
        {isEmpty && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-slate-400 dark:text-slate-500 select-none">
            <MessageSquare className="h-12 w-12 opacity-20" aria-hidden="true" />
            <p className="text-sm font-medium">{t('chat.empty')}</p>
            <p className="text-xs">{t('chat.emptyHint')}</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-2',
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
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

        {loading && (
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
            disabled={loading}
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
            disabled={loading || !prompt.trim()}
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
  )
}
