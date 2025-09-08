import React, { createContext, useContext, useState, ReactNode } from 'react'

interface RiskAssessment {
  risk_level: 'low' | 'medium' | 'high'
  description: string
  clause_text: string
  suggestion: string
}

interface ContractSummary {
  key_points: string[]
  total_clauses: number
  risk_assessments: RiskAssessment[]
  suggested_revisions: string[]
  overall_risk_score: number
}

interface ContractAnalysis {
  id: string
  filename: string
  upload_date: string
  summary: ContractSummary
  raw_content: string
  analysis_status: 'pending' | 'completed' | 'failed'
}

interface AnalysisContextType {
  currentAnalysis: ContractAnalysis | null
  analyses: ContractAnalysis[]
  loading: boolean
  setCurrentAnalysis: (analysis: ContractAnalysis | null) => void
  addAnalysis: (analysis: ContractAnalysis) => void
  updateAnalysis: (id: string, analysis: ContractAnalysis) => void
  setLoading: (loading: boolean) => void
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

export const useAnalysis = () => {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider')
  }
  return context
}

interface AnalysisProviderProps {
  children: ReactNode
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<ContractAnalysis | null>(null)
  const [analyses, setAnalyses] = useState<ContractAnalysis[]>([])
  const [loading, setLoading] = useState(false)

  const addAnalysis = (analysis: ContractAnalysis) => {
    setAnalyses(prev => [analysis, ...prev])
  }

  const updateAnalysis = (id: string, analysis: ContractAnalysis) => {
    setAnalyses(prev => prev.map(a => a.id === id ? analysis : a))
    if (currentAnalysis?.id === id) {
      setCurrentAnalysis(analysis)
    }
  }

  const value: AnalysisContextType = {
    currentAnalysis,
    analyses,
    loading,
    setCurrentAnalysis,
    addAnalysis,
    updateAnalysis,
    setLoading
  }

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  )
} 