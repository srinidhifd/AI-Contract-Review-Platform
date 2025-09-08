// Shared constants for the entire application
// This ensures consistency and makes maintenance easier

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 120000, // Increased to 2 minutes for AI analysis
  RETRY_ATTEMPTS: 3,
} as const

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.txt'],
} as const

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: {
    EXPANDED: '16rem', // 256px
    COLLAPSED: '4rem', // 64px
  },
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 768,
    DESKTOP: 1024,
    LARGE: 1280,
  },
} as const

// Risk Levels
export const RISK_LEVELS = {
  LOW: {
    threshold: 30,
    color: 'green',
    label: 'Low Risk',
  },
  MEDIUM: {
    threshold: 70,
    color: 'yellow',
    label: 'Medium Risk',
  },
  HIGH: {
    threshold: 100,
    color: 'red',
    label: 'High Risk',
  },
} as const

// Navigation Items
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    description: 'View your contract analyses and statistics',
  },
  {
    name: 'Analysis',
    href: '/analyze',
    description: 'Upload and analyze new contracts',
  },
  {
    name: 'Chat with Doc',
    href: '/contracts',
    description: 'Ask questions about your contracts',
  },
] as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload PDF, DOCX, or TXT files.',
  ANALYSIS_FAILED: 'Contract analysis failed. Please try again.',
  QUESTION_FAILED: 'Failed to get answer. Please try again.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in.',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  UPLOAD_SUCCESS: 'File uploaded successfully.',
  ANALYSIS_STARTED: 'Contract analysis started.',
  ANALYSIS_COMPLETED: 'Contract analysis completed.',
  QUESTION_SENT: 'Question sent successfully.',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_collapsed',
} as const

// LangChain Configuration (for future use)
export const LANGCHAIN_CONFIG = {
  DEFAULT_MODEL: 'mistral-large-latest',
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 4000,
  PROVIDERS: {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    MISTRAL: 'mistral',
    LOCAL: 'local',
  },
} as const

// Analytics Events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FILE_UPLOAD: 'file_upload',
  ANALYSIS_START: 'analysis_start',
  ANALYSIS_COMPLETE: 'analysis_complete',
  QUESTION_ASKED: 'question_asked',
  VOICE_RECORDING: 'voice_recording',
} as const

// Feature Flags (for future use)
export const FEATURE_FLAGS = {
  VOICE_CHAT: false,
  LANGCHAIN_INTEGRATION: false,
  ADVANCED_ANALYTICS: false,
  MULTI_LANGUAGE: false,
} as const 