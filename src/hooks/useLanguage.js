import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useAppStore from '@/store/useAppStore'

const SUPPORTED_LANGS = ['es', 'ca', 'en']

/**
 * Hook para gestionar el idioma de la aplicación.
 * Sincroniza i18next con el store de Zustand y localStorage.
 */
export function useLanguage() {
  const { i18n } = useTranslation()
  const { language, setLanguage } = useAppStore()

  const currentLang = language || i18n.language?.split('-')[0] || 'es'

  const changeLanguage = useCallback(
    (lang) => {
      if (!SUPPORTED_LANGS.includes(lang)) return
      i18n.changeLanguage(lang)
      setLanguage(lang)
      localStorage.setItem('app_lang', lang)
    },
    [i18n, setLanguage]
  )

  return {
    currentLang,
    changeLanguage,
    supportedLangs: SUPPORTED_LANGS,
  }
}
