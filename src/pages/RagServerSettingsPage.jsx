import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Clock3, FileCog, RefreshCw, Server, ShieldCheck } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import { authFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'

function friendlyLabel(key) {
  return key
    .toLowerCase()
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch (_) {
    return value || 'No disponible'
  }
}

function groupValues(values) {
  const groups = {
    Gemini: [],
    Ollama: [],
    Smirag: [],
    Sistema: [],
    Otros: [],
  }

  Object.entries(values || {}).forEach(([key, value]) => {
    if (key.startsWith('GEMINI_') || key === 'IA_SERVICE') {
      groups.Gemini.push([key, value])
      return
    }
    if (key.startsWith('OLLAMA_')) {
      groups.Ollama.push([key, value])
      return
    }
    if (key.startsWith('SMIRAG_')) {
      groups.Smirag.push([key, value])
      return
    }
    if (['ROOT_FOLDER', 'DOCS_PATH', 'DB_PATH', 'RAG_KEYWORD_CONFIG_DIR', 'API_URL'].includes(key)) {
      groups.Sistema.push([key, value])
      return
    }
    groups.Otros.push([key, value])
  })

  return groups
}

export default function RagServerSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [envData, setEnvData] = useState(null)

  const loadConfig = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authFetch('/api/ingestion/env')
      setEnvData(res?.data ?? null)
    } catch (err) {
      setError(err?.message || 'No se pudo cargar la configuración del servidor RAG.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const values = envData?.values ?? {}
  const groupedValues = useMemo(() => groupValues(values), [values])

  return (
    <main className="page-container py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ajustes del RAG Server</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Vista simplificada de la configuración activa del servidor de IA.
          </p>
        </div>
        <Button onClick={loadConfig} variant="outline" disabled={loading}>
          <RefreshCw className={cn('mr-1.5 h-4 w-4', loading && 'animate-spin')} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <FileCog className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Archivo activo</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{envData?.env_file_name || 'No disponible'}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock3 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Ultima actualizacion</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDate(envData?.last_modified)}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Server className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Variables visibles</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Object.keys(values).length}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Datos sensibles</span>
            </div>
            <Badge variant="success">Ocultos automaticamente</Badge>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {Object.entries(groupedValues).map(([groupName, entries]) => (
          <Card key={groupName}>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{groupName}</h2>
                <Badge>{entries.length}</Badge>
              </div>

              {entries.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Sin variables en este grupo.</p>
              ) : (
                <div className="space-y-2">
                  {entries.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {friendlyLabel(key)}
                      </p>
                      <p className="mt-1 break-all text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {String(value ?? '')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
