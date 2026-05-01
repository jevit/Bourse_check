import React, { createContext, useContext, useState, useCallback } from 'react'
import { login as apiLogin } from '../services/api'

interface AuthContextValue {
  username: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'))

  const login = useCallback(async (user: string, pass: string) => {
    const res = await apiLogin(user, pass)
    localStorage.setItem('jwt', res.data.token)
    localStorage.setItem('username', res.data.username)
    setUsername(res.data.username)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('jwt')
    localStorage.removeItem('username')
    setUsername(null)
  }, [])

  return (
    <AuthContext.Provider value={{ username, isAuthenticated: !!username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
