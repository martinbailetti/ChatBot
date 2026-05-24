import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Suspense } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/index'
import App from '@/App'

// Mock del store para evitar persistencia entre tests
vi.mock('@/store/useAppStore', () => ({
  default: vi.fn(() => ({
    darkMode: false,
    setDarkMode: vi.fn(),
    toggleDarkMode: vi.fn(),
    mobileMenuOpen: false,
    toggleMobileMenu: vi.fn(),
    closeMobileMenu: vi.fn(),
    language: 'es',
    setLanguage: vi.fn(),
  })),
}))

function renderRoute(path) {
  window.history.pushState({}, '', path)
  return render(
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  )
}

describe('Rutas principales', () => {
  beforeEach(() => {
    i18n.changeLanguage('es')
  })

  it('/ muestra la página de inicio', async () => {
    renderRoute('/')
    expect(
      await screen.findByRole('heading', { name: /plataforma de gestión/i })
    ).toBeInTheDocument()
  })

  it('/servicios muestra la página de servicios', async () => {
    renderRoute('/servicios')
    expect(
      await screen.findByRole('heading', { name: /servicios disponibles/i })
    ).toBeInTheDocument()
  })

  it('/acerca-de muestra la página de About', async () => {
    renderRoute('/acerca-de')
    expect(
      await screen.findByRole('heading', { name: /acerca de/i })
    ).toBeInTheDocument()
  })

  it('/contacto muestra el formulario de contacto', async () => {
    renderRoute('/contacto')
    expect(
      await screen.findByRole('heading', { name: /contacto/i })
    ).toBeInTheDocument()
  })

  it('/ruta-inexistente muestra 404', async () => {
    renderRoute('/ruta-inexistente')
    expect(
      await screen.findByRole('heading', { name: /página no encontrada/i })
    ).toBeInTheDocument()
  })
})
