import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { contractService } from '../services/contractService'
import ModernContractCard from '../components/ModernContractCard'
import { 
  Upload, 
  Trash2, 
  FileText, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Search,
  Plus,
  Grid,
  List,
  BarChart3
} from 'lucide-react'
import { formatDate, formatTime, getRiskLevel, clearAllDocumentData } from '../utils'
import { ContractAnalysis } from '../types'
import UploadModal from '../components/UploadModal'

const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<ContractAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'risk'>('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const navigate = useNavigate()

  useEffect(() => {
    loadContracts()
    clearAllDocumentData()
  }, [])

  const loadContracts = async () => {
    try {
      setLoading(true)
      const data = await contractService.listAnalyses()
      setContracts(data) // Show all contracts regardless of analysis status
    } catch (err) {
      console.error('Failed to load contracts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    setUploadModalOpen(false)
    loadContracts() // Refresh the list
  }

  const handleDeleteContract = async (contractId: string) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await contractService.deleteAnalysis(contractId)
        setContracts(contracts.filter(contract => contract.id !== contractId))
      } catch (err) {
        console.error('Failed to delete contract:', err)
      }
    }
  }

  const handleAnalyze = (contractId: string) => {
    navigate(`/results/${contractId}`)
  }

  const handleChat = (contractId: string) => {
    navigate(`/chat/${contractId}`)
  }

  // Filter and sort contracts
  const filteredContracts = contracts
    .filter(contract => {
      const matchesSearch = contract.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contract.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (filterRisk === 'all') return matchesSearch
      
      const riskLevel = getRiskLevel(contract.risk_score || 0)
      return matchesSearch && riskLevel.level.toLowerCase() === filterRisk
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.filename || '').localeCompare(b.filename || '')
        case 'risk':
          return (b.risk_score || 0) - (a.risk_score || 0)
        case 'date':
        default:
          return new Date(b.upload_date || 0).getTime() - new Date(a.upload_date || 0).getTime()
      }
    })

  const getRiskBadgeColor = (score: number) => {
    const risk = getRiskLevel(score)
    switch (risk.level) {
      case 'Low Risk': return 'bg-green-100 text-green-800'
      case 'Medium Risk': return 'bg-yellow-100 text-yellow-800'
      case 'High Risk': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  if (loading) {
    return (
      <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
                 {/* Header */}
         <div className="mb-4 sm:mb-6">
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div>
               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contracts</h1>
               <p className="mt-1 text-sm sm:text-base text-gray-600">Manage and analyze your contract documents</p>
             </div>
             <button
               onClick={() => setUploadModalOpen(true)}
               className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
             >
               <Plus className="h-5 w-5" />
               <span className="font-medium">Upload Contract</span>
             </button>
           </div>
         </div>

         {/* Search and Filter Bar */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4">
           <div className="flex flex-col lg:flex-row gap-4">
             {/* Search - 60% width */}
             <div className="flex-1 lg:w-3/5">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                 <input
                   type="text"
                   placeholder="Search contracts..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
                 />
               </div>
             </div>

             {/* Filters - 40% width */}
             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:w-2/5">
               {/* Risk Filter */}
               <select
                 value={filterRisk}
                 onChange={(e) => setFilterRisk(e.target.value as any)}
                 className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 bg-white"
               >
                 <option value="all">All Risk Levels</option>
                 <option value="low">Low Risk</option>
                 <option value="medium">Medium Risk</option>
                 <option value="high">High Risk</option>
               </select>

               {/* Sort */}
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value as any)}
                 className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 bg-white"
               >
                 <option value="date">Sort by Date</option>
                 <option value="name">Sort by Name</option>
                 <option value="risk">Sort by Risk</option>
               </select>

               {/* View Mode */}
               <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                 <button
                   onClick={() => setViewMode('grid')}
                   className={`p-3 transition-all duration-200 ${
                     viewMode === 'grid' 
                       ? 'bg-brand-600 text-white' 
                       : 'text-gray-600 hover:bg-gray-50'
                   }`}
                 >
                   <Grid className="h-4 w-4" />
                 </button>
                 <button
                   onClick={() => setViewMode('list')}
                   className={`p-3 transition-all duration-200 ${
                     viewMode === 'list' 
                       ? 'bg-brand-600 text-white' 
                       : 'text-gray-600 hover:bg-gray-50'
                   }`}
                 >
                   <List className="h-4 w-4" />
                 </button>
               </div>
             </div>
           </div>
         </div>

                 {/* Contracts Grid/List */}
         {filteredContracts.length === 0 ? (
           <div className="text-center py-12 px-4">
             <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
               <FileText className="h-12 w-12 text-gray-400" />
             </div>
             <h3 className="text-xl font-semibold text-gray-900 mb-2">No contracts found</h3>
             <p className="text-gray-600 mb-8 max-w-md mx-auto">
               {contracts.length === 0 
                 ? "Upload your first contract to get started with AI-powered analysis."
                 : "No contracts match your current search and filter criteria."
               }
             </p>
             {contracts.length === 0 && (
               <button
                 onClick={() => setUploadModalOpen(true)}
                 className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all duration-200 shadow-lg hover:shadow-xl"
               >
                 <Upload className="h-5 w-5" />
                 Upload Contract
               </button>
             )}
           </div>
         ) : (
           <div className={viewMode === 'grid' 
             ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4" 
             : "space-y-2 sm:space-y-3"
           }>
             {filteredContracts.map((contract) => (
               <div
                 key={contract.id}
                 className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-brand-200 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm ${
                   viewMode === 'list' ? 'flex items-center' : ''
                 }`}
               >
                 {viewMode === 'grid' ? (
                   <ModernContractCard
                     contract={contract}
                     onAnalyze={handleAnalyze}
                     onChat={handleChat}
                     onDelete={handleDeleteContract}
                     formatDate={formatDate}
                     formatTime={formatTime}
                     getRiskBadgeColor={getRiskBadgeColor}
                     getRiskLevel={getRiskLevel}
                   />
                 ) : (
                   // List View - Compact Design
                   <>
                     <div className="flex-1 p-4 sm:p-5">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3 min-w-0 flex-1">
                           <div className="p-2 bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg flex-shrink-0">
                             <FileText className="h-5 w-5 text-brand-600" />
                           </div>
                           <div className="min-w-0 flex-1">
                             <div className="flex items-center justify-between">
                               <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                                 {contract.filename || 'Untitled Contract'}
                               </h3>
                             </div>
                             <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                               <div className="flex items-center gap-1">
                                 <Calendar className="h-3 w-3" />
                                 <span>{formatDate(contract.upload_date || '')}</span>
                               </div>
                               <div className="flex items-center gap-1">
                                 <Clock className="h-3 w-3" />
                                 <span>{formatTime(new Date(contract.upload_date || ''))}</span>
                               </div>
                               <span className="font-medium">
                                 Risk: {contract.risk_score ? `${contract.risk_score.toFixed(1)}/100` : 'N/A'}
                               </span>
                             </div>
                           </div>
                         </div>
                         <div className="flex items-center gap-3 flex-shrink-0">
                           <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                             contract.analysis_status === 'completed' 
                               ? getRiskBadgeColor(contract.risk_score || 0)
                               : 'bg-yellow-100 text-yellow-800'
                           }`}>
                             {contract.analysis_status === 'completed' 
                               ? getRiskLevel(contract.risk_score || 0).level
                               : 'Processing'
                             }
                           </span>
                           <div className="flex gap-2">
                             <button
                               onClick={() => handleAnalyze(contract.id)}
                               disabled={contract.analysis_status === 'pending'}
                               className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 text-xs font-medium ${
                                 contract.analysis_status === 'completed' 
                                   ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800 shadow-md hover:shadow-lg' 
                                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                               }`}
                             >
                               <BarChart3 className="h-3.5 w-3.5" />
                               <span className="hidden sm:inline">Analysis</span>
                             </button>
                             <button
                               onClick={() => handleChat(contract.id)}
                               disabled={contract.analysis_status === 'pending'}
                               className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 text-xs font-medium ${
                                 contract.analysis_status === 'completed' 
                                   ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 shadow-md hover:shadow-lg' 
                                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                               }`}
                             >
                               <MessageSquare className="h-3.5 w-3.5" />
                               <span className="hidden sm:inline">Chat</span>
                             </button>
                             <button
                               onClick={() => handleDeleteContract(contract.id)}
                               className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md"
                               title="Delete contract"
                             >
                               <Trash2 className="h-3.5 w-3.5" />
                             </button>
                           </div>
                         </div>
                       </div>
                     </div>
                   </>
                 )}
               </div>
             ))}
           </div>
         )}

        {/* Upload Modal */}
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUploadComplete={() => {
            handleUploadSuccess()
          }}
        />
      </div>
    </div>
  )
}

export default ContractsPage
