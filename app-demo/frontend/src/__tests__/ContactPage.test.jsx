import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ContactPage from '../pages/ContactPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.open = vi.fn()
  })

  it('affiche les 3 champs du formulaire', () => {
    render(<MemoryRouter><ContactPage /></MemoryRouter>)
    expect(screen.getByLabelText(/votre email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/objet/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/votre message/i)).toBeInTheDocument()
  })

  it('affiche le bouton envoyer', () => {
    render(<MemoryRouter><ContactPage /></MemoryRouter>)
    expect(screen.getByText('Envoyer le message')).toBeInTheDocument()
  })

  it('ouvre le client mail avec les bonnes données à la soumission', () => {
    render(<MemoryRouter><ContactPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText(/votre email/i), { target: { value: 'test@exemple.fr' } })
    fireEvent.change(screen.getByLabelText(/objet/i),       { target: { value: 'Test objet' } })
    fireEvent.change(screen.getByLabelText(/votre message/i), { target: { value: 'Bonjour' } })
    fireEvent.click(screen.getByText('Envoyer le message'))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('mailto:olivier.labe@oldevops.fr'),
      '_blank'
    )
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('Test%20objet'),
      '_blank'
    )
  })

  it('affiche le message de confirmation après envoi', () => {
    render(<MemoryRouter><ContactPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText(/votre email/i), { target: { value: 'a@b.fr' } })
    fireEvent.change(screen.getByLabelText(/objet/i),       { target: { value: 'Sujet' } })
    fireEvent.change(screen.getByLabelText(/votre message/i), { target: { value: 'Message' } })
    fireEvent.click(screen.getByText('Envoyer le message'))
    expect(screen.getByText(/Votre client mail a été ouvert/)).toBeInTheDocument()
  })

  it('navigue vers / au clic sur retour', () => {
    render(<MemoryRouter><ContactPage /></MemoryRouter>)
    fireEvent.click(screen.getAllByText('Retour à l\'accueil')[0])
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
