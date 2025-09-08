import axios from 'axios'
import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from '../constants'
import { setLocalStorage, getLocalStorage, removeLocalStorage, handleApiError } from '../utils'

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Simply reject the error without complex redirect logic
    // Let components handle auth errors individually
    return Promise.reject(error)
  }
)

interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    full_name: string
    department: string
    role: string
    is_active: boolean
    created_at: string
  }
}

interface UserData {
  id: string
  email: string
  full_name: string
  department: string
  role: string
  is_active: boolean
  created_at: string
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
      })
      
      // Store the token and user data
      if (response.data.access_token) {
        setLocalStorage(STORAGE_KEYS.AUTH_TOKEN, response.data.access_token)
        setLocalStorage(STORAGE_KEYS.USER_DATA, response.data.user)
      }
      
      return response.data
    } catch (error) {
      // Clear any existing invalid tokens
      removeLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
      removeLocalStorage(STORAGE_KEYS.USER_DATA)
      throw new Error(handleApiError(error) || ERROR_MESSAGES.UNAUTHORIZED)
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/api/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    // Clear stored data (don't put in finally to avoid clearing if needed elsewhere)
    removeLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
    removeLocalStorage(STORAGE_KEYS.USER_DATA)
  }

  async getCurrentUser(): Promise<UserData> {
    try {
      const response = await api.get('/api/me')
      return response.data
    } catch (error) {
      // Clear invalid tokens
      removeLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
      removeLocalStorage(STORAGE_KEYS.USER_DATA)
      throw new Error(handleApiError(error) || ERROR_MESSAGES.UNAUTHORIZED)
    }
  }

  getStoredUser(): UserData | null {
    try {
      const userData = getLocalStorage(STORAGE_KEYS.USER_DATA) as UserData | null
      return userData || null
    } catch (error) {
      console.error('Error getting stored user data:', error)
      removeLocalStorage(STORAGE_KEYS.USER_DATA)
      return null
    }
  }

  isAuthenticated(): boolean {
    const token = getLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
    return !!token
  }

  getToken(): string | null {
    return getLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
  }

  clearAuth(): void {
    removeLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
    removeLocalStorage(STORAGE_KEYS.USER_DATA)
  }
}

export const authService = new AuthService() 