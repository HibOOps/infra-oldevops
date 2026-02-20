import { useState, useCallback } from 'react'

const TOKEN_KEY = 'pricesync_token'
const USER_KEY = 'pricesync_user'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem(USER_KEY)
    return u ? JSON.parse(u) : null
  })

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return { token, user, login, logout, isAuthenticated: !!token }
}
