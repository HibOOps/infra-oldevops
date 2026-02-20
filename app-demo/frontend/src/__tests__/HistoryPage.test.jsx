import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HistoryPage from '../pages/HistoryPage'

const mockHistory = [
  {
    id: 1, oldPrice: 44, newPrice: 42.5, changedAt: new Date().toISOString(), source: 'manual',
    product: { id: 1, sku: 'LUT-B001', name: 'Épicéa' },
    channel: { id: 1, name: 'Atelier Galileo Paris', type: 'physical' },
    changedBy: { id: 1, name: 'Alice Admin', email: 'admin@pricesync.demo' },
  },
]
const mockChannels = [{ id: 1, name: 'Atelier Galileo Paris' }]
const mockProducts = { data: [{ id: 1, sku: 'LUT-B001', name: 'Épicéa' }] }

vi.mock('../hooks/useApi', () => ({
  useApi: () => ({
    get: vi.fn().mockImplementation((path) => {
      if (path.includes('history')) return Promise.resolve(mockHistory)
      if (path.includes('channels')) return Promise.resolve(mockChannels)
      if (path.includes('products')) return Promise.resolve(mockProducts)
      return Promise.resolve([])
    }),
    loading: false,
  }),
}))

describe('HistoryPage', () => {
  it('affiche le titre', () => {
    render(<MemoryRouter><HistoryPage token="tok" /></MemoryRouter>)
    expect(screen.getByText('Historique des Modifications')).toBeInTheDocument()
  })

  it('affiche le bouton Export CSV', () => {
    render(<MemoryRouter><HistoryPage token="tok" /></MemoryRouter>)
    expect(screen.getByText('⬇ Export CSV')).toBeInTheDocument()
  })

  it('affiche les entrées d\'historique', async () => {
    render(<MemoryRouter><HistoryPage token="tok" /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('LUT-B001')).toBeInTheDocument())
    expect(screen.getByText('Manuel')).toBeInTheDocument()
  })
})
