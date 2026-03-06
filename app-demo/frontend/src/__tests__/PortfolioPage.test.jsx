import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PortfolioPage from '../pages/PortfolioPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('PortfolioPage', () => {
  it('affiche le nom et le rôle', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getByText('Olivier Labé')).toBeInTheDocument()
    expect(screen.getByText(/SysOps DevOps/)).toBeInTheDocument()
  })

  it('affiche les sections principales', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getByText('Services déployés')).toBeInTheDocument()
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
    expect(screen.getByText('Traefik v3')).toBeInTheDocument()
    expect(screen.getByText('Grafana / Prometheus')).toBeInTheDocument()
    expect(screen.getByText('Vaultwarden')).toBeInTheDocument()
    expect(screen.getByText('GitHub Runner')).toBeInTheDocument()
  })

  it('affiche les métriques clés', () => {
    render(<MemoryRouter><PortfolioPage /></MemoryRouter>)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('99.9%')).toBeInTheDocument()
    expect(screen.getByText('60%+')).toBeInTheDocument()
  })
})
