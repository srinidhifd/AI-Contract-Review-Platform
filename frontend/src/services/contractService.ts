import axios from 'axios'
import { 
  ContractAnalysis, 
  QuestionResponse
} from '../types'
import { API_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from '../constants'
import { handleApiError, getLocalStorage, removeLocalStorage } from '../utils'

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
    console.log('Request interceptor - Token:', token ? 'Present' : 'Missing')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('No auth token found for request:', config.url)
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
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - Token may be expired or invalid')
      // Clear invalid token
      removeLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
      removeLocalStorage(STORAGE_KEYS.USER_DATA)
      // Redirect to login page
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

class ContractService {
  async uploadDocument(file: File): Promise<any> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/api/v1/contracts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error) || ERROR_MESSAGES.ANALYSIS_FAILED)
    }
  }

  async getAnalysis(documentId: string | number): Promise<ContractAnalysis> {
    try {
      const response = await api.get(`/api/v1/contracts/${documentId}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error) || ERROR_MESSAGES.NOT_FOUND)
    }
  }

  async listAnalyses(): Promise<ContractAnalysis[]> {
    try {
      const response = await api.get('/api/v1/contracts/')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error) || ERROR_MESSAGES.SERVER_ERROR)
    }
  }

  async deleteAnalysis(documentId: string): Promise<void> {
    try {
      await api.delete(`/api/v1/contracts/${documentId}`)
    } catch (error) {
      throw new Error(handleApiError(error) || ERROR_MESSAGES.SERVER_ERROR)
    }
  }

  async triggerAnalysis(documentId: string): Promise<any> {
    try {
      const response = await api.post(`/api/v1/contracts/${documentId}/analyze`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error) || ERROR_MESSAGES.ANALYSIS_FAILED)
    }
  }



  async askQuestion(question: string, documentId: string): Promise<QuestionResponse> {
    try {
      const response = await api.post('/api/v1/chat/send', {
        message: question,
        document_id: documentId
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error) || ERROR_MESSAGES.QUESTION_FAILED)
    }
  }

  // Chat message methods
  async saveChatMessage(documentId: number, message: string, response: string): Promise<any> {
    try {
      const formData = new FormData()
      formData.append('document_id', documentId.toString())
      formData.append('message', message)
      formData.append('response', response)
      
      const apiResponse = await api.post('/api/chat/save', formData)
      return apiResponse.data
    } catch (error) {
      throw new Error(handleApiError(error) || 'Failed to save chat message')
    }
  }

  async getChatHistory(documentId: string): Promise<any[]> {
    try {
      console.log('Fetching chat history for document:', documentId)
      const response = await api.get(`/api/v1/chat/messages/${documentId}`)
      console.log('Chat history API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching chat history:', error)
      throw new Error(handleApiError(error) || 'Failed to get chat history')
    }
  }

  async clearChatHistory(documentId: string): Promise<void> {
    try {
      await api.delete(`/api/chat/${documentId}`)
    } catch (error) {
      throw new Error(handleApiError(error) || 'Failed to clear chat history')
    }
  }






}

export const contractService = new ContractService() 