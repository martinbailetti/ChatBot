import { describe, it, expect } from 'vitest'
import { cn } from '@/utils/cn'

describe('cn()', () => {
  it('devuelve una cadena vacía cuando no recibe argumentos', () => {
    expect(cn()).toBe('')
  })

  it('combina clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('ignora valores falsy', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar')
  })

  it('resuelve conflictos de Tailwind (tailwind-merge)', () => {
    // p-4 debe ganar sobre p-2
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('admite objetos condicionales (clsx)', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe(
      'text-red-500'
    )
  })
})
