import { useState, useCallback } from 'react'

const BASE = '/api'

export function useApi(token) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (method, path, body) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = res.status !== 204 ? await res.json() : null
      if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [token])

  const get = useCallback((path) => request('GET', path), [request])
  const post = useCallback((path, body) => request('POST', path, body), [request])
  const put = useCallback((path, body) => request('PUT', path, body), [request])
  const del = useCallback((path) => request('DELETE', path), [request])

  return { get, post, put, del, loading, error }
}
