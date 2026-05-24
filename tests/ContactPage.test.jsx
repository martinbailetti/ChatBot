import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/index'
import ContactPage from '@/pages/ContactPage'

function renderContact() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    </I18nextProvider>
  )
}

describe('ContactPage', () => {
  beforeEach(() => {
    i18n.changeLanguage('es')
  })

  it('muestra el formulario de contacto', () => {
    renderContact()
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument()
  })

  it('muestra errores de validación si se envía vacío', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    expect(await screen.findByText(/nombre es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByText(/correo electrónico es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByText(/mensaje no puede/i)).toBeInTheDocument()
  })

  it('muestra error de email inválido', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText(/nombre/i), 'Ana')
    await user.type(screen.getByLabelText(/correo/i), 'noesvalido')
    await user.type(screen.getByPlaceholderText(/consulta/i), 'Hola')
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    expect(await screen.findByText(/correo electrónico válido/i)).toBeInTheDocument()
  })

  it('muestra mensaje de éxito al enviar correctamente', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText(/nombre/i), 'Ana')
    await user.type(screen.getByLabelText(/correo/i), 'ana@empresa.com')
    await user.type(screen.getByPlaceholderText(/consulta/i), 'Quiero información')
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    expect(await screen.findByText(/mensaje enviado/i)).toBeInTheDocument()
  })
})
