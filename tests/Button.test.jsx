import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/ui/Button'

describe('Button', () => {
  it('renderiza el texto del hijo', () => {
    render(<Button>Aceptar</Button>)
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument()
  })

  it('aplica la variante primary por defecto', () => {
    render(<Button>OK</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/bg-indigo-600/)
  })

  it('aplica la variante danger', () => {
    render(<Button variant="danger">Eliminar</Button>)
    expect(screen.getByRole('button').className).toMatch(/bg-red-600/)
  })

  it('está deshabilitado cuando disabled=true', () => {
    render(<Button disabled>Bloqueado</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('está deshabilitado y muestra spinner cuando isLoading=true', () => {
    render(<Button isLoading>Guardando</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.querySelector('svg')).not.toBeNull()
  })

  it('llama onClick al pulsar', async () => {
    const user = userEvent.setup()
    let clicked = false
    render(<Button onClick={() => { clicked = true }}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(clicked).toBe(true)
  })
})
