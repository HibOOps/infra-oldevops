import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApi } from '../hooks/useApi'

describe('useApi', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('démarre avec loading=false et error=null', () => {
    const { result } = renderHook(() => useApi('tok'))
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('get() appelle fetch avec Authorization header', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    })
    const { result } = renderHook(() => useApi('my_token'))
    await act(async () => { await result.current.get('/products') })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my_token' }),
      })
    )
  })

  it('post() envoie le body en JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 'ok' }),
    })
    const { result } = renderHook(() => useApi(null))
    await act(async () => { await result.current.post('/auth/login', { email: 'a@b.com' }) })
    const call = global.fetch.mock.calls[0]
    expect(call[1].method).toBe('POST')
    expect(JSON.parse(call[1].body)).toEqual({ email: 'a@b.com' })
  })

  it('set error si la réponse n\'est pas ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Non autorisé' }),
    })
    const { result } = renderHook(() => useApi('tok'))
    await act(async () => {
      try { await result.current.get('/products') } catch {}
    })
    expect(result.current.error).toBe('Non autorisé')
  })

  it('del() appelle DELETE', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    const { result } = renderHook(() => useApi('tok'))
    await act(async () => { await result.current.del('/products/1') })
    expect(global.fetch).toHaveBeenCalledWith('/api/products/1', expect.objectContaining({ method: 'DELETE' }))
  })
})
