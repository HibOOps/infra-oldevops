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

  it('la ligne Type+Valeur a la classe form-row-2col (colonne unique sur mobile)', () => {
    render(<RuleForm channels={channels} products={products} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const typeSelect = screen.getByRole('combobox')
    expect(typeSelect.closest('.form-row-2col')).toBeInTheDocument()
  })

  it('les boutons ont la classe form-actions (pleine largeur sur mobile)', () => {
    render(<RuleForm channels={channels} products={products} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const cancelBtn = screen.getByText('Annuler')
    expect(cancelBtn.closest('.form-actions')).toBeInTheDocument()
  })

  it('le champ valeur numérique a inputMode decimal', () => {
    render(<RuleForm channels={channels} products={products} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const numInput = screen.getAllByRole('spinbutton')[0]
    expect(numInput).toHaveAttribute('inputmode', 'decimal')
  })

  it('les inputs ont minHeight 44px', () => {
    render(<RuleForm channels={channels} products={products} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const nameInput = screen.getByPlaceholderText('ex: Promo Cordes Web -15%')
    expect(nameInput.style.minHeight).toBe('44px')
  })
})
