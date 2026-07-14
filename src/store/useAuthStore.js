import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store de autenticación local.
 * Persiste token y datos de usuario en localStorage bajo la clave 'chatbot-auth'.
 */
const useAuthStore = create(
  persist(
    (set) => ({
      /** Indica si Zustand ya rehidrató el estado persistido */
      hasHydrated: false,
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

      /** Marca que la rehidratación del store finalizó */
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'chatbot-auth',
      partialize: (state) => ({
        token: state.token,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export default useAuthStore
