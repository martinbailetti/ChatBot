import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '@/components/ui/Card'

describe('Card', () => {
  it('renderiza los hijos', () => {
    render(<Card>Contenido</Card>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('Card.Header renderiza su contenido', () => {
    render(
      <Card>
        <Card.Header>Título</Card.Header>
      </Card>
    )
    expect(screen.getByText('Título')).toBeInTheDocument()
  })

  it('Card.Body renderiza su contenido', () => {
    render(
      <Card>
        <Card.Body>Cuerpo</Card.Body>
      </Card>
    )
    expect(screen.getByText('Cuerpo')).toBeInTheDocument()
  })

  it('Card.Footer renderiza su contenido', () => {
    render(
      <Card>
        <Card.Footer>Pie</Card.Footer>
      </Card>
    )
    expect(screen.getByText('Pie')).toBeInTheDocument()
  })

  it('acepta className adicional', () => {
    const { container } = render(<Card className="my-custom-class">X</Card>)
    expect(container.firstChild.className).toMatch(/my-custom-class/)
  })
})
