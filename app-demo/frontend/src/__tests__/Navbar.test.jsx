import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const defaultProps = {
  user: { name: 'Admin' },
  onLogout: vi.fn(),
}

function renderNavbar(props = {}) {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Navbar {...defaultProps} {...props} />
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('affiche le logo PriceSync', () => {
    renderNavbar()
    expect(screen.getByText(/PriceSync/)).toBeInTheDocument()
  })

  it('affiche les 5 liens desktop', () => {
    renderNavbar()
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Produits').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Prix').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Règles').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Historique').length).toBeGreaterThan(0)
  })

  it('affiche le nom utilisateur', () => {
    renderNavbar()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('affiche le bouton hamburger avec aria-label', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: 'Menu de navigation' })).toBeInTheDocument()
  })

  it('hamburger a aria-expanded=false par défaut', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: 'Menu de navigation' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('ouvre le menu mobile au clic sur hamburger', () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Menu de navigation' }))
    expect(screen.getByRole('button', { name: 'Menu de navigation' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('ferme le menu mobile au second clic', () => {
    renderNavbar()
    const hamburger = screen.getByRole('button', { name: 'Menu de navigation' })
    fireEvent.click(hamburger)
    fireEvent.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  it('affiche les liens dans le panneau mobile ouvert', () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Menu de navigation' }))
    // Links appear in both desktop + mobile panels
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Historique').length).toBeGreaterThan(1)
  })

  it('ferme le menu mobile après clic sur un lien', () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Menu de navigation' }))
    const mobileLinks = screen.getAllByText('Produits')
    fireEvent.click(mobileLinks[mobileLinks.length - 1])
    expect(screen.getByRole('button', { name: 'Menu de navigation' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('déconnexion appelle onLogout et navigue vers /login', () => {
    const onLogout = vi.fn()
    renderNavbar({ onLogout })
    // Click desktop logout
    fireEvent.click(screen.getAllByText('Déconnexion')[0])
    expect(onLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('déconnexion depuis le menu mobile fonctionne', () => {
    const onLogout = vi.fn()
    renderNavbar({ onLogout })
    fireEvent.click(screen.getByRole('button', { name: 'Menu de navigation' }))
    const logoutBtns = screen.getAllByText('Déconnexion')
    fireEvent.click(logoutBtns[logoutBtns.length - 1])
    expect(onLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
