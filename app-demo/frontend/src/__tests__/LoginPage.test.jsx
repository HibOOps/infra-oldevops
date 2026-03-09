import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('rend le titre et le formulaire', () => {
    render(<MemoryRouter><LoginPage onLogin={vi.fn()} /></MemoryRouter>)
    expect(screen.getByText('PriceSync')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('admin@pricesync.demo')).toBeInTheDocument()
  })

  it('appelle onLogin et redirige si login réussi', async () => {
    const onLogin = vi.fn()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'tok123', user: { name: 'Alice', role: 'admin' } }),
    })
    render(<MemoryRouter><LoginPage onLogin={onLogin} /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('admin@pricesync.demo'), { target: { value: 'admin@pricesync.demo' } })
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: 'Admin2024!' } })
    fireEvent.click(screen.getByText('Se connecter'))
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith('tok123', { name: 'Alice', role: 'admin' }))
  })

  it('les inputs ont font-size 1rem (pas de zoom iOS)', () => {
    render(<MemoryRouter><LoginPage onLogin={vi.fn()} /></MemoryRouter>)
    const emailInput = screen.getByPlaceholderText('admin@pricesync.demo')
    expect(emailInput.style.fontSize).toBe('1rem')
  })

  it('les inputs ont minHeight 44px (zone tactile)', () => {
    render(<MemoryRouter><LoginPage onLogin={vi.fn()} /></MemoryRouter>)
    const emailInput = screen.getByPlaceholderText('admin@pricesync.demo')
    expect(emailInput.style.minHeight).toBe('44px')
  })

  it('affiche une erreur si le login échoue', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Email ou mot de passe incorrect' }),
    })
    render(<MemoryRouter><LoginPage onLogin={vi.fn()} /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('admin@pricesync.demo'), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByText('Se connecter'))
    await waitFor(() => expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument())
  })
})
