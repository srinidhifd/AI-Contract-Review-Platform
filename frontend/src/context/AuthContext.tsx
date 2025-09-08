import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'
import { getLocalStorage, removeLocalStorage } from '../utils'
import { STORAGE_KEYS } from '../constants'

interface User {
  id: string
  email: string
  full_name: string
  department: string
  role: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Simple token check on app start using utility functions
    const token = getLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
    const userData = getLocalStorage(STORAGE_KEYS.USER_DATA) as User | null
    
    if (token && userData) {
      setUser(userData)
      setIsAuthenticated(true)
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
      throw error
    }
  }

  const logout = () => {
    // Simple logout - clear everything locally using utility functions
    removeLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
    removeLocalStorage(STORAGE_KEYS.USER_DATA)
    setUser(null)
    setIsAuthenticated(false)
    
    // Call backend logout in background (don't wait for it)
    authService.logout().catch(error => {
      console.error('Backend logout error (ignored):', error)
    })
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 