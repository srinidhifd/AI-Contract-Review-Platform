import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { contractService } from '../services/contractService'
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react'

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const [contractsCount, setContractsCount] = useState(0)
  const [conversationsCount, setConversationsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserStats()
  }, [])

  const loadUserStats = async () => {
    try {
      setLoading(true)
      // Load contracts count
      const contracts = await contractService.listAnalyses()
      setContractsCount(contracts.length)
      
      // For now, we'll estimate conversations based on contracts
      // In a real app, you'd have a separate API for this
      setConversationsCount(contracts.filter(c => c.analysis_status === 'completed').length)
    } catch (error) {
      console.error('Failed to load user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading user information...</div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    })
  }

  const getDepartmentIcon = (department: string) => {
    switch (department?.toLowerCase()) {
      case 'legal': return <Shield className="h-5 w-5" />
      case 'hr': case 'human resources': return <User className="h-5 w-5" />
      case 'sales': return <BarChart3 className="h-5 w-5" />
      case 'finance': return <Building2 className="h-5 w-5" />
      case 'it': return <FileText className="h-5 w-5" />
      default: return <Building2 className="h-5 w-5" />
    }
  }


  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-8">
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-white">{user.full_name}</h2>
                    <p className="text-white/80 text-sm mt-1">{user.department} Team</p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="px-6 py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
                
                <div className="space-y-5">
                  {/* Full Name */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-gray-900">{user.full_name}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>



                  {/* Department */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getDepartmentIcon(user.department)}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Department</p>
                      <p className="text-gray-900">{user.department}</p>
                    </div>
                  </div>


                  {/* Account Created */}
                  {user.created_at && (
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                        <p className="text-gray-900">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Activity Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Type</span>
                  <span className="text-gray-900 capitalize">{user.role}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {loading ? '...' : contractsCount}
                    </p>
                    <p className="text-xs text-gray-500">Contracts Analyzed</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {loading ? '...' : conversationsCount}
                    </p>
                    <p className="text-xs text-gray-500">AI Conversations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Info */}
            <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl border border-brand-200 p-6">
              <div className="flex items-center mb-4">
                {getDepartmentIcon(user.department)}
                <h3 className="text-lg font-semibold text-gray-900 ml-2">{user.department}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                You're part of the {user.department} team. This gives you access to department-specific contract templates and analysis workflows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage