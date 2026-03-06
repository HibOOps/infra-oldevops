import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BioPage from '../pages/BioPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('BioPage', () => {
  it('affiche le nom et le rôle', () => {
    render(<MemoryRouter><BioPage /></MemoryRouter>)
    expect(screen.getByText('Olivier Labé')).toBeInTheDocument()
    expect(screen.getByText(/SysOps DevOps/)).toBeInTheDocument()
  })

  it('affiche le lien de téléchargement du CV', () => {
    render(<MemoryRouter><BioPage /></MemoryRouter>)
    const cvLink = screen.getByText('Télécharger le CV (PDF)').closest('a')
    expect(cvLink).toHaveAttribute('href', '/assets/cv-olivier-labe.pdf')
    expect(cvLink).toHaveAttribute('download')
  })

  it('navigue vers / au clic sur retour', () => {
    render(<MemoryRouter><BioPage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Retour à l\'accueil'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
