import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RulesPage from '../pages/RulesPage'

const mockRules = [
  {
    id: 1, name: 'Promo Cordes Web -15%', type: 'percentage', value: -15,
    channelIds: [2], productIds: [14, 15, 16], isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: { id: 1, name: 'Alice Admin' },
  },
]
const mockChannels = [{ id: 1, name: 'Atelier Galileo Paris' }, { id: 2, name: 'galileo-shop.fr' }]
const mockProducts = { data: [{ id: 14, sku: 'LUT-C001', name: 'Cordes' }] }

vi.mock('../hooks/useApi', () => ({
  useApi: () => ({
    get: vi.fn().mockImplementation((path) => {
      if (path.includes('rules')) return Promise.resolve(mockRules)
      if (path.includes('channels')) return Promise.resolve(mockChannels)
      if (path.includes('products')) return Promise.resolve(mockProducts)
      return Promise.resolve([])
    }),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    del: vi.fn().mockResolvedValue(null),
    loading: false,
  }),
}))

describe('RulesPage', () => {
  it('affiche le titre', () => {
    render(<MemoryRouter><RulesPage token="tok" /></MemoryRouter>)
    expect(screen.getByText('Règles de Pricing')).toBeInTheDocument()
  })

  it('affiche le bouton Nouvelle règle', () => {
    render(<MemoryRouter><RulesPage token="tok" /></MemoryRouter>)
    expect(screen.getByText('+ Nouvelle règle')).toBeInTheDocument()
  })

  it('affiche les règles après chargement', async () => {
    render(<MemoryRouter><RulesPage token="tok" /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Promo Cordes Web -15%')).toBeInTheDocument())
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('affiche la valeur de la règle en rouge (négatif)', async () => {
    render(<MemoryRouter><RulesPage token="tok" /></MemoryRouter>)
    await waitFor(() => screen.getByText('Promo Cordes Web -15%'))
    expect(screen.getByText('-15%')).toBeInTheDocument()
  })
})
