import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PriceMatrix from '../components/PriceMatrix'

const channels = [
  { id: 1, name: 'Atelier Galileo Paris', type: 'physical' },
  { id: 2, name: 'galileo-shop.fr', type: 'ecommerce' },
]
const products = [
  {
    id: 1,
    sku: 'LUT-B001',
    name: 'Épicéa Solid Top AAA',
    category: 'Bois',
    referencePrice: 45,
    prices: [
      { channelId: 1, price: 48, channel: { id: 1, name: 'Atelier Galileo Paris' } },
      { channelId: 2, price: 45, channel: { id: 2, name: 'galileo-shop.fr' } },
    ],
  },
]

describe('PriceMatrix', () => {
  it('rend le tableau avec les colonnes canaux', () => {
    render(<PriceMatrix products={products} channels={channels} onUpdatePrice={vi.fn()} />)
    expect(screen.getByTestId('price-matrix')).toBeInTheDocument()
    expect(screen.getByText('Atelier Galileo Paris')).toBeInTheDocument()
    expect(screen.getByText('galileo-shop.fr')).toBeInTheDocument()
  })

  it('affiche le SKU du produit', () => {
    render(<PriceMatrix products={products} channels={channels} onUpdatePrice={vi.fn()} />)
    expect(screen.getByText('LUT-B001')).toBeInTheDocument()
  })

  it('affiche le prix de référence', () => {
    render(<PriceMatrix products={products} channels={channels} onUpdatePrice={vi.fn()} />)
    // '45.00 €' apparaît plusieurs fois (prix ref + prix canal 2)
    const priceEls = screen.getAllByText('45.00 €')
    expect(priceEls.length).toBeGreaterThan(0)
  })

  it('affiche un badge de statut sync', () => {
    render(<PriceMatrix products={products} channels={channels} onUpdatePrice={vi.fn()} />)
    // LUT-B001 avec 48 vs ref 45 = +6.7% → delta
    expect(screen.getByText('Delta')).toBeInTheDocument()
  })

  it('affiche le scroll hint par défaut', () => {
    render(<PriceMatrix products={products} channels={channels} onUpdatePrice={vi.fn()} />)
    expect(screen.getByTestId('scroll-hint')).toBeInTheDocument()
  })

  it('les colonnes Catégorie et Réf. ont la classe table-col-hide-mobile', () => {
    render(<PriceMatrix products={products} channels={channels} onUpdatePrice={vi.fn()} />)
    const catHeaders = screen.getAllByText('Catégorie')
    expect(catHeaders[0].closest('th, td')).toHaveClass('table-col-hide-mobile')
  })

  it('la colonne SKU a la classe table-sticky-col', () => {
    render(<PriceMatrix products={products} channels={channels} onUpdatePrice={vi.fn()} />)
    const skuHeader = screen.getByText('SKU')
    expect(skuHeader.closest('th')).toHaveClass('table-sticky-col')
  })

  it('cache le scroll hint après scroll du tableau', () => {
    render(<PriceMatrix products={products} channels={channels} onUpdatePrice={vi.fn()} />)
    const scrollWrap = screen.getByTestId('price-matrix').querySelector('.table-scroll-wrap')
    fireEvent.scroll(scrollWrap)
    expect(screen.queryByTestId('scroll-hint')).not.toBeInTheDocument()
  })
})
