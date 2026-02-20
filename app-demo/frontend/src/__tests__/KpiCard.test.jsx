import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KpiCard from '../components/KpiCard'

describe('KpiCard', () => {
  it('affiche la valeur et le label', () => {
    render(<KpiCard label="Produits" value={20} color="#6366f1" icon="📦" />)
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('Produits')).toBeInTheDocument()
  })
})
