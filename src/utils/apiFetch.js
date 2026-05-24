import useAuthStore from '@/store/useAuthStore'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8888'

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

/**
 * Wrapper base sobre fetch.
 * Añade Content-Type: application/json.
 * No incluye cabecera de autorización (rutas públicas).
 */
export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText)
    throw new Error(`API error ${response.status}: ${errorText}`)
  }

  return parseResponse(response)
}

/**
 * Wrapper autenticado sobre fetch.
 * Inyecta "Authorization: Bearer {token}" desde el store de Zustand.
 * Si la respuesta es 401, limpia la sesión y redirige a /login.
 */
export async function authFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const token = useAuthStore.getState().token

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    useAuthStore.getState().clearAuth()
    // Redirigir al login sin depender de React Router
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Sesión expirada. Inicia sesión de nuevo.')
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText)
    throw new Error(`API error ${response.status}: ${errorText}`)
  }

  return parseResponse(response)
}

/**
 * Igual que authFetch pero devuelve la Response sin parsear.
 * Útil para descargar binarios (PDF, etc.).
 */
export async function authFetchRaw(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const token = useAuthStore.getState().token

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    useAuthStore.getState().clearAuth()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Sesión expirada. Inicia sesión de nuevo.')
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status}`)
  }

  return response
}
