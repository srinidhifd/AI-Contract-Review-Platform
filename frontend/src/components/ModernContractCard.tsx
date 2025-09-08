import React from 'react'
import { 
  BarChart3, 
  MessageSquare, 
  Trash2 
} from 'lucide-react'
import { ContractAnalysis } from '../types'

interface ModernContractCardProps {
  contract: ContractAnalysis
  onAnalyze: (id: string) => void
  onChat: (id: string) => void
  onDelete: (id: string) => void
  formatDate: (date: string) => string
  formatTime: (date: Date) => string
  getRiskBadgeColor: (score: number) => string
  getRiskLevel: (score: number) => { level: string }
}

const ModernContractCard: React.FC<ModernContractCardProps> = ({
  contract,
  onAnalyze,
  onChat,
  onDelete,
  formatDate,
  formatTime,
  getRiskBadgeColor,
  getRiskLevel
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-brand-400 hover:scale-[1.02] hover:bg-gray-50 transition-all duration-300 group">
      {/* Card Header - Professional Hierarchy */}
      <div className="p-4">
        {/* Document Name - Primary Focus */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-gray-900 text-xl mb-1 leading-tight group-hover:text-brand-700 transition-colors">
              {contract.filename || 'Untitled Contract'}
            </h3>
            <div className="text-sm text-gray-500 font-medium">
              {formatDate(contract.upload_date || '')} • {formatTime(new Date(contract.upload_date || ''))}
            </div>
          </div>
          <button
            onClick={() => onDelete(contract.id)}
            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 flex items-center justify-center flex-shrink-0 hover:scale-105"
            title="Delete contract"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Risk Assessment Section - Visual Anchor */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Risk Assessment</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-sm font-bold ${getRiskBadgeColor(contract.risk_score || 0)}`}>
              {getRiskLevel(contract.risk_score || 0).level}
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {contract.risk_score ? `${contract.risk_score.toFixed(1)}` : 'N/A'}
            </span>
            <span className="text-sm text-gray-500 font-medium">/ 100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-700 ${
                (contract.risk_score || 0) >= 70 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                (contract.risk_score || 0) >= 30 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                'bg-gradient-to-r from-green-500 to-green-600'
              }`}
              style={{ width: `${Math.min((contract.risk_score || 0), 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Summary Section - Clean Typography */}
        {contract.summary && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-3 bg-brand-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Summary</span>
            </div>
            <p className="text-gray-600 leading-relaxed line-clamp-3 text-sm">
              {contract.summary}
            </p>
          </div>
        )}

        {/* Visual Divider */}
        <div className="border-t border-gray-100 mb-4"></div>
      </div>

      {/* Action Buttons - Professional CTA */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex gap-3">
          <button
            onClick={() => onAnalyze(contract.id)}
            disabled={contract.analysis_status === 'pending'}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-semibold flex-1 ${
              contract.analysis_status === 'completed' 
                ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>View Analysis</span>
          </button>
          <button
            onClick={() => onChat(contract.id)}
            disabled={contract.analysis_status === 'pending'}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-semibold flex-1 ${
              contract.analysis_status === 'completed' 
                ? 'bg-slate-600 text-white hover:bg-slate-700 shadow-md hover:shadow-lg hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Start Chat</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModernContractCard
