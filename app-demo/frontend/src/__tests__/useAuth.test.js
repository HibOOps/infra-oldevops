import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

import { useAuth } from '../hooks/useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('démarre non authentifié si localStorage vide', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBeNull()
    expect(result.current.user).toBeNull()
  })

  it('login stocke le token et l\'user', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.login('tok123', { name: 'Alice', role: 'admin' })
    })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('tok123')
    expect(result.current.user.name).toBe('Alice')
    expect(localStorageMock.getItem('pricesync_token')).toBe('tok123')
  })

  it('logout efface le token et l\'user', () => {
    const { result } = renderHook(() => useAuth())
    act(() => { result.current.login('tok123', { name: 'Alice' }) })
    act(() => { result.current.logout() })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBeNull()
    expect(localStorageMock.getItem('pricesync_token')).toBeNull()
  })

  it('lit le token depuis localStorage au démarrage', () => {
    localStorageMock.setItem('pricesync_token', 'existing_tok')
    localStorageMock.setItem('pricesync_user', JSON.stringify({ name: 'Bob' }))
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('existing_tok')
    expect(result.current.user.name).toBe('Bob')
  })
})
