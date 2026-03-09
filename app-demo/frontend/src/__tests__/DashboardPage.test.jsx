import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'

const mockProducts = [
  { id: 1, sku: 'LUT-B001', name: 'Épicéa Solid Top', category: 'Bois', referencePrice: 45, prices: [{ channelId: 1, price: 51 }, { channelId: 2, price: 45 }, { channelId: 3, price: 40 }] },
  { id: 2, sku: 'LUT-A002', name: 'Cordier Chrome', category: 'Accastillage', referencePrice: 32, prices: [{ channelId: 1, price: 32 }, { channelId: 2, price: 32 }, { channelId: 3, price: 32 }] },
]
const mockChannels = [
  { id: 1, name: 'Atelier Galileo Paris', type: 'physical', isActive: true },
  { id: 2, name: 'galileo-shop.fr', type: 'ecommerce', isActive: true },
  { id: 3, name: 'Marketplace Woodcraft', type: 'marketplace', isActive: true },
]
const mockRules = [{ id: 1, isActive: true, name: 'Promo Cordes' }]

vi.mock('../hooks/useApi', () => ({
  useApi: () => ({
    get: vi.fn().mockImplementation((path) => {
      if (path.includes('products')) return Promise.resolve({ data: mockProducts, total: 2 })
      if (path.includes('channels')) return Promise.resolve(mockChannels)
      if (path.includes('rules')) return Promise.resolve(mockRules)
      return Promise.resolve([])
    }),
    post: vi.fn().mockResolvedValue({ updated: 2, unchanged: 3, triggeredAt: new Date().toISOString() }),
    loading: false,
  }),
}))

describe('DashboardPage', () => {
  it('affiche les KPIs après chargement', async () => {
    render(<MemoryRouter><DashboardPage token="tok" /></MemoryRouter>)
    await waitFor(() => expect(screen.getByTestId('kpi-section')).toBeInTheDocument())
    expect(screen.getByText('2')).toBeInTheDocument() // total produits
    expect(screen.getByText('Produits')).toBeInTheDocument()
  })

  it('affiche le titre Dashboard', async () => {
    render(<MemoryRouter><DashboardPage token="tok" /></MemoryRouter>)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('affiche le bouton Synchroniser tout', async () => {
    render(<MemoryRouter><DashboardPage token="tok" /></MemoryRouter>)
    expect(screen.getByText('🔄 Synchroniser tout')).toBeInTheDocument()
  })

  it('déclenche la sync au clic', async () => {
    render(<MemoryRouter><DashboardPage token="tok" /></MemoryRouter>)
    await waitFor(() => screen.getByText('🔄 Synchroniser tout'))
    fireEvent.click(screen.getByText('🔄 Synchroniser tout'))
    await waitFor(() => expect(screen.getByText(/Synchronisation terminée/)).toBeInTheDocument())
  })

  it('le kpi-section a la classe kpi-grid (grille 2-col mobile)', async () => {
    render(<MemoryRouter><DashboardPage token="tok" /></MemoryRouter>)
    const section = screen.getByTestId('kpi-section')
    expect(section).toHaveClass('kpi-grid')
  })

  it('le bouton Synchroniser a minHeight 48px', () => {
    render(<MemoryRouter><DashboardPage token="tok" /></MemoryRouter>)
    const btn = screen.getByText('🔄 Synchroniser tout')
    expect(btn.style.minHeight).toBe('48px')
  })

  it('les colonnes Catégorie et Prix de référence ont table-col-hide-mobile', async () => {
    render(<MemoryRouter><DashboardPage token="tok" /></MemoryRouter>)
    await waitFor(() => screen.getByText('Épicéa Solid Top'))
    const catHeader = screen.getByText('Catégorie')
    expect(catHeader).toHaveClass('table-col-hide-mobile')
    const refHeader = screen.getByText('Prix de référence')
    expect(refHeader).toHaveClass('table-col-hide-mobile')
  })

  it('affiche la colonne Delta dans le tableau désync', async () => {
    render(<MemoryRouter><DashboardPage token="tok" /></MemoryRouter>)
    await waitFor(() => screen.getByText('Épicéa Solid Top'))
    expect(screen.getByText('Delta')).toBeInTheDocument()
    const deltaCells = screen.getAllByTestId('delta-cell')
    expect(deltaCells.length).toBeGreaterThan(0)
  })
})
