import { useEffect } from 'react'
import useAppStore from '@/store/useAppStore'

/**
 * Hook para gestionar el modo oscuro.
 * Sincroniza el estado de Zustand con la clase 'dark' del documento.
 */
export function useDarkMode() {
  const { darkMode, setDarkMode, toggleDarkMode } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  return { darkMode, setDarkMode, toggleDarkMode }
}
