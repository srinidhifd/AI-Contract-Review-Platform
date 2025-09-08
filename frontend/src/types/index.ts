// Shared types for the entire application
// This makes the codebase more scalable and consistent

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

export interface ContractAnalysis {
  id: string
  filename: string
  upload_date: string
  summary?: string
  raw_content?: string
  analysis_status: AnalysisStatus
  upload_purpose?: UploadPurpose
  risk_score?: number
  total_clauses?: number
  file_size?: number
  file_type?: string
  supports_chat?: boolean
  supports_analysis?: boolean
  key_points?: string[]
  risk_assessments?: RiskAssessment[]
  suggested_revisions?: string[]
}

export interface ContractSummary {
  key_points: string[]
  total_clauses: number
  risk_assessments: RiskAssessment[]
  suggested_revisions: string[]
  overall_risk_score: number
}

export interface RiskAssessment {
  category: string
  severity: string
  description: string
  recommendation: string
  original_clause?: string
  ai_suggestion?: string
  impact_score?: number
  likelihood_score?: number
  overall_score?: number
}

export interface AnalysisResponse {
  message?: string
  document_id?: number
  analysis_status?: string
  chunks_created?: number
  analysis_result?: any
}

export interface QuestionRequest {
  question: string
  analysis_id: number
}

export interface QuestionResponse {
  id: string
  message: string
  response: string
  timestamp: string
  message_type: string
  relevant_sections?: string[]
  page_references?: string[]
}

// Chat message types for both text and voice chat
export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  relevant_sections?: string[]
  page_references?: string[]
  isVoice?: boolean
}

// Voice-specific message type (deprecated - voice chat removed)
export interface VoiceMessage extends ChatMessage {
  isVoice: boolean
}

// Upload purpose type
export type UploadPurpose = 'analysis' | 'chat'

// Risk level type
export type RiskLevel = 'low' | 'medium' | 'high'

// Analysis status type  
export type AnalysisStatus = 'pending' | 'completed' | 'failed'

// LangChain integration types (for future use)
export interface LangChainConfig {
  model: string
  temperature: number
  max_tokens: number
  provider: 'openai' | 'anthropic' | 'mistral' | 'local'
}

export interface LangChainResponse {
  answer: string
  sources: string[]
  confidence: number
  processing_time: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  full_name: string
  role: string
}

// Navigation types
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

// Performance and analytics types
export interface PerformanceStats {
  total_analyses: number
  average_processing_time: number
  success_rate: number
  popular_questions: string[]
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
} 