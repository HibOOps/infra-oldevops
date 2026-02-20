import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductsPage from '../pages/ProductsPage'

const mockData = {
  data: [
    { id: 1, sku: 'LUT-B001', name: 'Épicéa Solid Top AAA', category: 'Bois', referencePrice: 45, prices: [] },
    { id: 2, sku: 'LUT-M001', name: 'Mécaniques Gotoh', category: 'Mécaniques', referencePrice: 72, prices: [] },
  ],
  total: 2,
  pages: 1,
}

vi.mock('../hooks/useApi', () => ({
  useApi: () => ({
    get: vi.fn().mockResolvedValue(mockData),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    del: vi.fn().mockResolvedValue(null),
    loading: false,
  }),
}))

describe('ProductsPage', () => {
  it('affiche le titre', () => {
    render(<MemoryRouter><ProductsPage token="tok" /></MemoryRouter>)
    expect(screen.getByText(/Catalogue Produits/)).toBeInTheDocument()
  })

  it('affiche les boutons de filtre catégorie', () => {
    render(<MemoryRouter><ProductsPage token="tok" /></MemoryRouter>)
    expect(screen.getByText('Bois')).toBeInTheDocument()
    expect(screen.getByText('Cordes')).toBeInTheDocument()
  })

  it('affiche le bouton Nouveau produit', () => {
    render(<MemoryRouter><ProductsPage token="tok" /></MemoryRouter>)
    expect(screen.getByText('+ Nouveau produit')).toBeInTheDocument()
  })

  it('liste les produits après chargement', async () => {
    render(<MemoryRouter><ProductsPage token="tok" /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('LUT-B001')).toBeInTheDocument())
    expect(screen.getByText('LUT-M001')).toBeInTheDocument()
  })
})
