import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'

const mockProducts = [
  { id: 1, sku: 'LUT-B001', name: 'Épicéa Solid Top', category: 'Bois', referencePrice: 45, prices: [{ channelId: 1, price: 48 }, { channelId: 2, price: 45 }, { channelId: 3, price: 42.5 }] },
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
})
