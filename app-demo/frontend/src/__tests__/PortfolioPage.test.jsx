import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PortfolioPage from '../pages/PortfolioPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('PortfolioPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })

  it('affiche le nom et le rôle', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getByText('Olivier Labé')).toBeInTheDocument()
    expect(screen.getByText(/SysOps DevOps/)).toBeInTheDocument()
  })

  it('affiche les sections principales', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getByText('Services déployés')).toBeInTheDocument()
    expect(screen.getByText('Architecture interactive')).toBeInTheDocument()
    expect(screen.getByText('Timeline du projet')).toBeInTheDocument()
    expect(screen.getByText('Stack technique')).toBeInTheDocument()
    expect(screen.getByText('Pipeline CI/CD')).toBeInTheDocument()
    expect(screen.getByText('Métriques clés')).toBeInTheDocument()
  })

  it('affiche le bouton PriceSync App', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getByText('Tester PriceSync App')).toBeInTheDocument()
  })

  it('navigue vers /login au clic sur Tester PriceSync App', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Tester PriceSync App'))
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('navigue vers / au clic sur Accueil', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Accueil'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('affiche les 6 services', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getAllByText('Traefik v3').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Grafana / Prometheus').length).toBeGreaterThan(0)
    expect(screen.getByText('Vaultwarden')).toBeInTheDocument()
    expect(screen.getByText('GitHub Runner')).toBeInTheDocument()
  })

  it('affiche les métriques clés', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('99.9%')).toBeInTheDocument()
    expect(screen.getByText('60%+')).toBeInTheDocument()
  })

  it('affiche le badge API status en vérification au départ', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getByTestId('api-status-badge')).toBeInTheDocument()
    expect(screen.getByText(/Vérification/)).toBeInTheDocument()
  })

  it('affiche API en ligne après fetch réussi', async () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/En ligne/)).toBeInTheDocument())
  })

  it('affiche API hors ligne si fetch échoue', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'))
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/Hors ligne/)).toBeInTheDocument())
  })

  it('affiche les nœuds architecture', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getByText('Internet')).toBeInTheDocument()
    expect(screen.getByText('Proxmox VE 8')).toBeInTheDocument()
    expect(screen.getByText('PriceSync')).toBeInTheDocument()
    expect(screen.getByText('CI Runner')).toBeInTheDocument()
    expect(screen.getAllByText('Monitoring').length).toBeGreaterThan(0)
  })

  it('affiche les étapes de la timeline', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getByText('Fondations')).toBeInTheDocument()
    expect(screen.getAllByText('App PriceSync').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Observabilité').length).toBeGreaterThan(0)
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
  })
})
