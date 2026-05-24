import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/index'
import Navbar from '@/components/Navbar'

// Mock mínimo del store para estado determinista
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

function renderNavbar() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </I18nextProvider>
  )
}

describe('Navbar', () => {
  beforeEach(() => {
    i18n.changeLanguage('es')
  })

  it('muestra el logo "Nexus"', () => {
    renderNavbar()
    expect(screen.getByText('Nexus')).toBeInTheDocument()
  })

  it('muestra el enlace Inicio', () => {
    renderNavbar()
    // Hay varios links con texto que contiene 'inicio'; buscamos el de la nav
    const links = screen.getAllByRole('link', { name: /inicio/i })
    const navHomeLink = links.find(
      (el) => el.getAttribute('href') === '/' && !el.getAttribute('aria-label')
    )
    expect(navHomeLink).toBeDefined()
  })

  it('muestra el enlace Servicios', () => {
    renderNavbar()
    expect(screen.getByRole('link', { name: /servicios/i })).toBeInTheDocument()
  })

  it('muestra el enlace Contacto', () => {
    renderNavbar()
    expect(screen.getByRole('link', { name: /contacto/i })).toBeInTheDocument()
  })

  it('no muestra ningún enlace de login ni registro', () => {
    renderNavbar()
    expect(screen.queryByRole('link', { name: /login|entrar|registr/i })).toBeNull()
  })
})
