// Shared utilities for the entire application
// This provides common functions and helpers

import { RISK_LEVELS } from '../constants'

// Date formatting utilities
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  })
}

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  })
}

// Risk level utilities
export const getRiskLevel = (score: number) => {
  if (score <= RISK_LEVELS.LOW.threshold) {
    return { 
      level: RISK_LEVELS.LOW.label, 
      color: 'text-green-600', 
      bg: 'bg-green-100' 
    }
  }
  if (score <= RISK_LEVELS.MEDIUM.threshold) {
    return { 
      level: RISK_LEVELS.MEDIUM.label, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-100' 
    }
  }
  return { 
    level: RISK_LEVELS.HIGH.label, 
    color: 'text-red-600', 
    bg: 'bg-red-100' 
  }
}

// Import Lucide React icons
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'

export const getRiskIcon = (score: number) => {
  if (score >= 70) return AlertTriangle
  if (score >= 30) return Clock
  return CheckCircle
}

export const getRiskIconName = (score: number): string => {
  if (score >= 70) return 'AlertTriangle'
  if (score >= 30) return 'Clock'
  return 'CheckCircle'
}

export const getRiskColor = (score: number): string => {
  if (score >= 70) return 'text-red-600 bg-red-50 border-red-200'
  if (score >= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-green-600 bg-green-50 border-green-200'
}

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  return allowedTypes.includes(file.type)
}

export const validateFileSize = (file: File, maxSize: number = 10 * 1024 * 1024): boolean => {
  return file.size <= maxSize
}

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const formatMessageContent = (content: string | undefined): string => {
  if (!content) return ''
  return content
    // Remove all JSON artifacts completely - much more aggressive approach
    .replace(/^```json\s*/g, '')
    .replace(/```\s*$/g, '')
    .replace(/^json\s*/g, '')
    .replace(/^\{[\s\S]*"answer":\s*"([\s\S]*?)"[\s\S]*\}$/g, '$1')
    .replace(/^\{[\s\S]*"answer":\s*"([\s\S]*?)"[\s\S]*$/g, '$1')
    .replace(/^[\s\S]*"answer":\s*"([\s\S]*?)"[\s\S]*\}$/g, '$1')
    .replace(/^\{[\s\S]*\}$/g, '')
    .replace(/^\[[\s\S]*\]$/g, '')
    .replace(/\{[^{}]*\}/g, '')
    .replace(/\[[^\[\]]*\]/g, '')
    .replace(/"[^"]*":\s*/g, '')
    .replace(/^"([\s\S]*)"$/g, '$1')
    .replace(/^'([\s\S]*)'$/g, '$1')
    
    // Remove common JSON field names
    .replace(/"answer":\s*/g, '')
    .replace(/"relevant_sections":\s*/g, '')
    .replace(/"page_references":\s*/g, '')
    .replace(/"source_locations":\s*/g, '')
    
    // Handle markdown headers - convert to styled headings
    .replace(/^####\s+(.*?)(?=\n|$)/gm, '<h4 class="text-base font-semibold text-gray-900 mb-3 mt-4">$1</h4>')
    .replace(/^###\s+(.*?)(?=\n|$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mb-3 mt-4">$1</h3>')
    .replace(/^##\s+(.*?)(?=\n|$)/gm, '<h2 class="text-xl font-semibold text-gray-900 mb-3 mt-4">$1</h2>')
    .replace(/^#\s+(.*?)(?=\n|$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mb-4 mt-4">$1</h1>')
    
    // Bold formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Italic formatting
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
    
    // Handle bullet points with hierarchy - main points vs sub-points
    .replace(/•\s*(.*?)(?=\n|$)/gm, '<div class="flex items-start mb-2"><span class="inline-block w-1.5 h-1.5 bg-brand-500 rounded-full mr-3 mt-2.5 flex-shrink-0"></span><span class="flex-1 leading-relaxed">$1</span></div>')
    
    // AGGRESSIVE HYPHEN REPLACEMENT - use smaller gray bullets for sub-points
    // All hyphens get smaller gray bullet style for cleaner look
    .replace(/(\n|^)\s*[-–—]\s*(.*?)(?=\n|$)/gm, '$1<div class="flex items-start mb-1.5"><span class="inline-block w-1 h-1 bg-gray-400 rounded-full mr-2.5 mt-2.5 flex-shrink-0"></span><span class="flex-1 leading-relaxed">$2</span></div>')
    
    // Catch any remaining standalone hyphens at start of text
    .replace(/^[-–—]\s*(.*?)(?=\n|$)/gm, '<div class="flex items-start mb-1.5"><span class="inline-block w-1 h-1 bg-gray-400 rounded-full mr-2.5 mt-2.5 flex-shrink-0"></span><span class="flex-1 leading-relaxed">$1</span></div>')
    
    .replace(/^\*\s+(.*?)(?=\n|$)/gm, '<div class="flex items-start mb-2"><span class="inline-block w-1.5 h-1.5 bg-brand-500 rounded-full mr-3 mt-2.5 flex-shrink-0"></span><span class="flex-1 leading-relaxed">$1</span></div>')
    
    // Handle numbered lists with consistent professional styling
    .replace(/^\d+\.\s+(.*?)(?=\n|$)/gm, (match, text) => {
      const number = match.match(/^(\d+)\./)?.[1] || '1'
      return `<div class="flex items-start mb-2"><span class="inline-flex items-center justify-center w-5 h-5 bg-brand-100 text-brand-700 rounded-full text-xs font-medium mr-3 mt-1 flex-shrink-0">${number}</span><span class="flex-1 leading-relaxed">${text}</span></div>`
    })
    
    // Line breaks and paragraph formatting
    .replace(/\n\n+/g, '</p><p class="mb-3 leading-relaxed">')
    .replace(/\n/g, '<br>')
    
    // Wrap content in paragraph if not already wrapped (but skip headings and divs)
    .replace(/^(?!<div|<p|<h[1-6])(.*?)$/gm, '<p class="mb-3 leading-relaxed">$1</p>')
    
    // Clean up formatting
    .replace(/<p class="mb-3 leading-relaxed"><\/p>/g, '')
    .replace(/<p class="mb-3 leading-relaxed"><div/g, '<div')
    .replace(/<p class="mb-3 leading-relaxed"><h([1-6])/g, '<h$1')
    .replace(/<\/div><\/p>/g, '</div>')
    .replace(/<\/h[1-6]><\/p>/g, '')
    .replace(/<br><div/g, '<div')
    .replace(/<br><h([1-6])/g, '<h$1')
    .replace(/<\/div><br>/g, '</div>')
    .replace(/<\/h[1-6]><br>/g, '')
    
    // Remove trailing whitespace
    .trim()
}

// Local storage utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error setting localStorage:', error)
  }
}

export const getLocalStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue || null
  } catch (error) {
    console.error('Error getting localStorage:', error)
    return defaultValue || null
  }
}

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing localStorage:', error)
  }
}

// URL utilities
export const getQueryParam = (param: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

export const setQueryParam = (param: string, value: string): void => {
  const url = new URL(window.location.href)
  url.searchParams.set(param, value)
  window.history.replaceState({}, '', url.toString())
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error?.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 8
}

// Animation utilities
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Color utilities
export const getContrastColor = (hexColor: string): string => {
  // Remove the # if present
  const hex = hexColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// LangChain utilities (for future use)
export const formatLangChainResponse = (response: any) => {
  return {
    answer: response.answer || response.content || '',
    sources: response.sources || [],
    confidence: response.confidence || 0,
    processing_time: response.processing_time || 0,
  }
}

export const clearChatHistory = (analysisId: string) => {
  localStorage.removeItem(`chat_${analysisId}`)
}

export const clearAllDocumentData = () => {
  // Get all localStorage keys
  const keys = Object.keys(localStorage)
  
  // Remove all chat-related data
  keys.forEach(key => {
    if (key.startsWith('chat_') || 
        key.startsWith('voice_') || 
        key.startsWith('analysis_') || 
        key.startsWith('document_') ||
        key.includes('contract') ||
        key.includes('upload')) {
      localStorage.removeItem(key)
    }
  })
  

} 