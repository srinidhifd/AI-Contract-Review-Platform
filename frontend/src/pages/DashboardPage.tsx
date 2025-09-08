import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { contractService } from '../services/contractService'
import UploadModal from '../components/UploadModal'
import { clearAllDocumentData } from '../utils'
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  BarChart3,
  Star,
  Zap,
  HelpCircle,
  Target
} from 'lucide-react'
import { ContractAnalysis } from '../types'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<ContractAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  useEffect(() => {
    loadAnalyses()
    clearAllDocumentData()
  }, [])

  const loadAnalyses = async () => {
    try {
      setLoading(true)
      const data = await contractService.listAnalyses()
      setAnalyses(data)
    } catch (err) {
      console.error('Failed to load analyses:', err)
    } finally {
      setLoading(false)
    }
  }

  // Business-focused analytics
  const getBusinessMetrics = () => {
    const total = analyses.length
    const completed = analyses.filter(a => a.analysis_status === 'completed').length
    const pending = analyses.filter(a => a.analysis_status === 'pending').length
    const highRisk = analyses.filter(a => a.analysis_status === 'completed' && ((a as any).risk_score || 0) >= 70).length
    const mediumRisk = analyses.filter(a => a.analysis_status === 'completed' && ((a as any).risk_score || 0) >= 30 && ((a as any).risk_score || 0) < 70).length
    const lowRisk = analyses.filter(a => a.analysis_status === 'completed' && ((a as any).risk_score || 0) < 30).length
    const avgRisk = analyses.filter(a => a.analysis_status === 'completed')
      .reduce((sum, a) => sum + ((a as any).risk_score || 0), 0) / (completed || 1)
    
    const recentActivity = analyses.filter(a => {
      const uploadDate = new Date(a.upload_date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return uploadDate > weekAgo
    }).length

    const todayActivity = analyses.filter(a => {
      const uploadDate = new Date(a.upload_date)
      const today = new Date()
      return uploadDate.toDateString() === today.toDateString()
    }).length

    const monthActivity = analyses.filter(a => {
      const uploadDate = new Date(a.upload_date)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return uploadDate > monthAgo
    }).length

    const totalFileSize = analyses.length * 1024 // Approximate file size
    const avgProcessingTime = completed > 0 ? "< 30 sec" : "No data yet"

    return { total, completed, pending, highRisk, mediumRisk, lowRisk, avgRisk, recentActivity, todayActivity, monthActivity, totalFileSize, avgProcessingTime }
  }

  const businessMetrics = getBusinessMetrics()

  // Chart data preparation
  const getChartData = () => {
    // Risk distribution pie chart data
    const riskDistributionData = [
      { name: 'Low Risk', value: businessMetrics.lowRisk, color: '#10B981' },
      { name: 'Medium Risk', value: businessMetrics.mediumRisk, color: '#F59E0B' },
      { name: 'High Risk', value: businessMetrics.highRisk, color: '#EF4444' }
    ]

    // Activity over time (September 1-7, 2025)
    const activityData = []
    const septemberStart = new Date(2025, 8, 1) // September 1, 2025 (month is 0-indexed)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(septemberStart)
      date.setDate(septemberStart.getDate() + i)
      
      const dayAnalyses = analyses.filter(a => {
        const uploadDate = new Date(a.upload_date)
        return uploadDate.toDateString() === date.toDateString()
      }).length
      
      activityData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uploads: dayAnalyses,
        completed: analyses.filter(a => {
          const uploadDate = new Date(a.upload_date)
          return uploadDate.toDateString() === date.toDateString() && a.analysis_status === 'completed'
        }).length
      })
    }

    // Risk score distribution
    const riskScoreData = analyses
      .filter(a => a.analysis_status === 'completed' && (a as any).risk_score)
      .map(a => ({
        name: a.filename?.substring(0, 15) + '...' || 'Contract',
        riskScore: (a as any).risk_score || 0
      }))
      .slice(0, 5) // Show top 5

    return { riskDistributionData, activityData, riskScoreData }
  }

  const chartData = getChartData()



  const recentContracts = analyses
    .filter(a => a.analysis_status === 'completed')
    .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
    .slice(0, 3)

  const welcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon" 
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
          <span className="ml-3 text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Welcome Header - Compact Style */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {welcomeMessage()}, {user?.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Ready to review some contracts? Let's transform your workflow.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">AI Ready</span>
        </div>
            </div>
          </div>
        </div>
      </div>

          

      {/* Charts Section - All in One Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-600" />
            Risk Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
        </div>
          <div className="flex justify-center gap-3 mt-3">
            {chartData.riskDistributionData.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
          </div>
        ))}
          </div>
          </div>
          
        {/* Activity Over Time Line Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            Activity Over Time
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: '#666' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#666', fontSize: 12 } }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#666' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  label={{ value: 'Activity Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666', fontSize: 12 } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="uploads" 
                  stackId="1" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stackId="1" 
                  stroke="#06B6D4" 
                  fill="#06B6D4" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Risk Score Bar Chart */}
        {chartData.riskScoreData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-brand-600" />
              Contract Risk Scores
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.riskScoreData} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#666' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    label={{ value: 'Contract Name', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#666', fontSize: 12 } }}
                  />
                                     <YAxis 
                     tick={{ fontSize: 10, fill: '#666' }}
                     domain={[0, 100]}
                     ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]}
                     tickCount={21}
                     label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666', fontSize: 12 } }}
                   />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '12px', 
                      padding: '8px',
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="riskScore" 
                    fill="url(#riskGradient)"
                    radius={[2, 2, 0, 0]}
                    label={{ 
                      position: 'top', 
                      fontSize: 10, 
                      fill: '#374151',
                      formatter: (value: any) => `${Number(value).toFixed(1)}`
                    }}
                  />
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
          </div>
            </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-brand-600" />
                  </div>
                  Recent Contracts
          </h2>
                <Link to="/contracts" className="text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg font-medium text-sm hover:bg-brand-50 transition-all duration-200">
                  View All →
          </Link>
              </div>
        </div>

            {recentContracts.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
                <p className="text-gray-600 mb-6">Upload your first contract to get started with AI-powered analysis.</p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                className="btn btn-primary"
              >
                  Upload Your First Contract
                </button>
          </div>
        ) : (
              <div className="divide-y divide-gray-100">
                {recentContracts.map((contract) => (
                  <div key={contract.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                                          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-brand-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {contract.filename}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{new Date(contract.upload_date).toLocaleDateString()}</span>
                            <span>Risk: {contract.risk_score ? contract.risk_score.toFixed(1) : 'N/A'}/100</span>
                          </div>
                      </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/chat/${contract.id}`}
                          className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Chat
                        </Link>
                          <Link
                          to={`/results/${contract.id}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                          Analysis
                          </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help & Tips Sidebar */}
        <div className="space-y-6">
          {/* Getting Started */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center mr-3">
                <HelpCircle className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-brand-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Star className="h-3 w-3 text-brand-600" />
                </div>
                <span className="text-gray-700 text-sm">Upload any contract (PDF, Word, or text)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-brand-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Star className="h-3 w-3 text-brand-600" />
                </div>
                <span className="text-gray-700 text-sm">Ask questions in plain English</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-brand-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Star className="h-3 w-3 text-brand-600" />
                </div>
                <span className="text-gray-700 text-sm">Get instant risk analysis</span>
              </li>
            </ul>
          </div>

          {/* Business Tips */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pro Tips</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700 text-sm">Ask "What are the risks?" for quick overview</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700 text-sm">Check payment terms before signing</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-50 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700 text-sm">Review termination clauses carefully</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={() => {
          loadAnalyses()
        }}
      />
      </div>
    </div>
  )
}

export default DashboardPage 