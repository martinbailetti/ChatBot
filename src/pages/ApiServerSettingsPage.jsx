import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Clock3, Database, Globe, RefreshCw, ServerCog, ShieldCheck } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { authFetch } from '@/utils/apiFetch'
import { cn } from '@/utils/cn'

function niceLabel(key) {
  return key
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function groupConfig(config) {
  const groups = {
    Aplicacion: [],
    CORS: [],
    BaseDeDatos: [],
    Autenticacion: [],
    Integraciones: [],
    Otros: [],
  }

  Object.entries(config || {}).forEach(([key, value]) => {
    if (key.startsWith('APP_')) {
      groups.Aplicacion.push([key, value])
      return
    }
    if (key.startsWith('CORS_')) {
      groups.CORS.push([key, value])
      return
    }
    if (key.startsWith('DB_')) {
      groups.BaseDeDatos.push([key, value])
      return
    }
    if (key.startsWith('AUTH_')) {
      groups.Autenticacion.push([key, value])
      return
    }
    if (key.startsWith('DOCS_') || key.endsWith('_URL')) {
      groups.Integraciones.push([key, value])
      return
    }
    groups.Otros.push([key, value])
  })

  return groups
}

export default function ApiServerSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [serverData, setServerData] = useState(null)

  const loadServerConfig = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authFetch('/api/config/server')
      setServerData(res?.data ?? null)
    } catch (err) {
      setError(err?.message || 'No se pudo cargar la configuracion del API Server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadServerConfig()
  }, [loadServerConfig])

  const configValues = serverData?.config ?? {}
  const grouped = useMemo(() => groupConfig(configValues), [configValues])

  return (
    <main className="page-container py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ajustes del API Server</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Informacion clave del servidor en formato claro y facil de leer.
          </p>
        </div>
        <Button onClick={loadServerConfig} variant="outline" disabled={loading}>
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
              <ServerCog className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Entorno</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{configValues.APP_ENV || 'No definido'}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock3 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Zona horaria</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{serverData?.timezone || 'No disponible'}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Database className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Variables publicas</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Object.keys(configValues).length}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Seguridad</span>
            </div>
            <Badge variant="success">DB_PASS y AUTH_SECRET ocultos</Badge>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Archivo de entorno</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{serverData?.env_file || 'No disponible'}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Version PHP</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{serverData?.php_version || 'No disponible'}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Globe className="h-4 w-4" />
              <p className="text-xs uppercase tracking-wide">Servidor</p>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{serverData?.hostname || 'No disponible'}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Conexion CORS</p>
            <p className="mt-1 break-all text-sm font-semibold text-slate-900 dark:text-slate-100">{configValues.CORS_ALLOWED_ORIGINS || 'No definido'}</p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {Object.entries(grouped).map(([group, entries]) => (
          <Card key={group}>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{group}</h2>
                <Badge>{entries.length}</Badge>
              </div>

              {entries.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No hay datos en este bloque.</p>
              ) : (
                <div className="space-y-2">
                  {entries.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {niceLabel(key)}
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
