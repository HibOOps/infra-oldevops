import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RuleForm from '../components/RuleForm'

const channels = [
  { id: 1, name: 'Atelier Galileo Paris' },
  { id: 2, name: 'galileo-shop.fr' },
]
const products = [
  { id: 1, sku: 'LUT-B001' },
  { id: 2, sku: 'LUT-C001' },
]

describe('RuleForm', () => {
  it('rend le formulaire avec les champs requis', () => {
    render(<RuleForm channels={channels} products={products} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByTestId('rule-form')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ex: Promo Cordes Web -15%')).toBeInTheDocument()
  })

  it('affiche les canaux comme checkboxes', () => {
    render(<RuleForm channels={channels} products={products} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Atelier Galileo Paris')).toBeInTheDocument()
    expect(screen.getByText('galileo-shop.fr')).toBeInTheDocument()
  })

  it('appelle onCancel au clic Annuler', () => {
    const onCancel = vi.fn()
    render(<RuleForm channels={channels} products={products} onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Annuler'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('affiche le preview quand une valeur est saisie', () => {
    render(<RuleForm channels={channels} products={products} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const input = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(input, { target: { value: '-15' } })
    expect(screen.getByText(/Preview/)).toBeInTheDocument()
  })
})
