import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store global de la aplicación.
 * Solo gestiona estado de UI/preferencias de app.
 */
const useAppStore = create(
  persist(
    (set) => ({
      // Modo oscuro
      darkMode: false,
      setDarkMode: (value) => set({ darkMode: value }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // Idioma seleccionado
      language: '',
      setLanguage: (lang) => set({ language: lang }),

      // Estado del menú móvil
      mobileMenuOpen: false,
      setMobileMenuOpen: (value) => set({ mobileMenuOpen: value }),
      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      closeMobileMenu: () => set({ mobileMenuOpen: false }),
    }),
    {
      name: 'nexus-app-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        language: state.language,
      }),
    }
  )
)

export default useAppStore
