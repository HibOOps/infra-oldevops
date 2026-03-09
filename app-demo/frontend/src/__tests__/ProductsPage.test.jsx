import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

  it('affiche le scroll hint par défaut', () => {
    render(<MemoryRouter><ProductsPage token="tok" /></MemoryRouter>)
    expect(screen.getByTestId('scroll-hint')).toBeInTheDocument()
  })

  it('la colonne Catégorie a la classe table-col-hide-mobile', () => {
    render(<MemoryRouter><ProductsPage token="tok" /></MemoryRouter>)
    const catHeader = screen.getByText('Catégorie')
    expect(catHeader.closest('th')).toHaveClass('table-col-hide-mobile')
  })

  it('le formulaire produit a la classe form-grid-2col (1 colonne sur mobile)', async () => {
    render(<MemoryRouter><ProductsPage token="tok" /></MemoryRouter>)
    fireEvent.click(screen.getByText('+ Nouveau produit'))
    const form = document.querySelector('.form-grid-2col')
    expect(form).toBeInTheDocument()
  })

  it('les boutons du formulaire ont la classe form-actions', async () => {
    render(<MemoryRouter><ProductsPage token="tok" /></MemoryRouter>)
    fireEvent.click(screen.getByText('+ Nouveau produit'))
    const cancelBtn = screen.getByText('Annuler')
    expect(cancelBtn.closest('.form-actions')).toBeInTheDocument()
  })

  it('le champ prix de référence a inputMode decimal', async () => {
    render(<MemoryRouter><ProductsPage token="tok" /></MemoryRouter>)
    fireEvent.click(screen.getByText('+ Nouveau produit'))
    const priceInput = screen.getAllByRole('spinbutton')[0]
    expect(priceInput).toHaveAttribute('inputmode', 'decimal')
  })
})
