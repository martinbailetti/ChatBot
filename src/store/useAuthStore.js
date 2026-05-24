import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store de autenticación local.
 * Persiste token y datos de usuario en localStorage bajo la clave 'nexus-auth'.
 */
const useAuthStore = create(
  persist(
    (set) => ({
      /** @type {string|null} */
      token: null,
      /** @type {string|null} ISO-8601 */
      expiresAt: null,
      /** @type {{ Id: number, email: string, first_name: string, last_name: string }|null} */
      user: null,

      /** Guarda token + usuario tras login exitoso */
      setAuth: (token, expiresAt, user) =>
        set({ token, expiresAt, user }),

      /** Borra la sesión (logout) */
      clearAuth: () =>
        set({ token: null, expiresAt: null, user: null }),

      /** Actualiza solo los datos del usuario (p.ej. tras GET /api/auth/me) */
      setUser: (user) => set({ user }),
    }),
    {
      name: 'nexus-auth',
      partialize: (state) => ({
        token: state.token,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
    }
  )
)

export default useAuthStore
