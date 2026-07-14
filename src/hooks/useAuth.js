import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/useAuthStore'
import { apiFetch, authFetch } from '@/utils/apiFetch'

/**
 * Hook de autenticación.
 *
 * Expone:
 *  - isAuthenticated  booleano
 *  - isTokenExpired   booleano
 *  - user             datos públicos del usuario o null
 *  - token            string o null
 *  - login(email, password) → { ok, error? }
 *  - logout()
 *  - refreshMe()      → recarga los datos del usuario desde GET /api/auth/me
 */
export function useAuth() {
  const { token, expiresAt, user, hasHydrated, setAuth, clearAuth, setUser } = useAuthStore()
  const navigate = useNavigate()

  const isTokenExpired = useCallback(() => {
    if (!expiresAt) return true
    return new Date(expiresAt).getTime() < Date.now()
  }, [expiresAt])

  const isAuthenticated = !!token && !isTokenExpired()

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email, password) => {
      try {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })

        if (!res.success || !res.data) {
          return { ok: false, error: res.message || 'Error de autenticación.' }
        }

        const { token: newToken, expires_at, user: newUser } = res.data
        setAuth(newToken, expires_at, newUser)
        return { ok: true }
      } catch (err) {
        // El error puede venir del servidor (4xx) o de red
        let message = 'Error de conexión con el servidor.'
        try {
          const parsed = JSON.parse(err.message.replace(/^API error \d+: /, ''))
          message = parsed.message || message
        } catch (_) { /* no-op */ }
        return { ok: false, error: message }
      }
    },
    [setAuth]
  )

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // Notificar al servidor (stateless, pero buena práctica)
      if (token) {
        await authFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      }
    } finally {
      clearAuth()
      navigate('/login')
    }
  }, [token, clearAuth, navigate])

  // ── refreshMe ─────────────────────────────────────────────────────────────
  const refreshMe = useCallback(async () => {
    if (!token) return
    try {
      const res = await authFetch('/api/auth/me')
      if (res.success && res.data) {
        setUser(res.data)
      }
    } catch (_) {
      // authFetch ya gestiona 401. Para errores transitorios (red/5xx),
      // conservar sesión local y permitir reintento.
    }
  }, [token, setUser])

  const isAdmin = user?.type === 'ADMIN'

  return {
    isHydrated: hasHydrated,
    isAuthenticated,
    isAdmin,
    isTokenExpired: isTokenExpired(),
    user,
    token,
    login,
    logout,
    refreshMe,
  }
}
