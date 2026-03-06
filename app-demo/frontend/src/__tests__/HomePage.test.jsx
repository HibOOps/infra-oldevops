import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('HomePage', () => {
  it('affiche le nom et le badge SysOps DevOps', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText('Olivier Labé')).toBeInTheDocument()
    expect(screen.getByText('SysOps DevOps')).toBeInTheDocument()
  })

  it('affiche les 4 boutons de navigation', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText('Bio')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('navigue vers /portfolio au clic sur Portfolio DevOps', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Portfolio DevOps'))
    expect(mockNavigate).toHaveBeenCalledWith('/portfolio')
  })

  it('navigue vers /bio au clic sur Bio', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Bio'))
    expect(mockNavigate).toHaveBeenCalledWith('/bio')
  })

  it('navigue vers /contact au clic sur Contact', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Contact'))
    expect(mockNavigate).toHaveBeenCalledWith('/contact')
  })

  it('le lien LinkedIn pointe vers la bonne URL', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    const linkedinLink = screen.getByText('LinkedIn').closest('a')
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/olivier-labe/')
  })

  it('ne contient pas le bouton PriceSync App', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.queryByText('PriceSync App')).not.toBeInTheDocument()
  })
})
