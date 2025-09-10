import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToaster } from '../context/ToasterContext'
import Logo from '../components/Logo'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  ArrowLeft, 
  Mail,
  Loader2,
  Shield,
  FileText,
  MessageSquare,
  TrendingUp
} from 'lucide-react'
import { signupSchema, type SignupFormData } from '../utils/validation'

const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { } = useAuth()
  const { success, error: showError } = useToaster()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate form data with Zod
    const formData: SignupFormData = {
      fullName: fullName.trim(),
      email: email.trim(),
      department: department.trim(),
      password,
      confirmPassword
    }

    try {
      signupSchema.parse(formData)
    } catch (validationError: any) {
      console.log('Validation error:', validationError)
      const firstError = validationError.errors?.[0] || validationError.issues?.[0]
      if (firstError) {
        setError(firstError.message)
        showError(firstError.message)
      } else {
        setError('Please check your information and try again.')
        showError('Please check your information and try again.')
      }
      setLoading(false)
      return
    }

    try {
      // Call signup API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          department,
          role: 'user'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errorMessage = errorData.detail || 'Registration failed'
        
        // Provide user-friendly error messages
        if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
          errorMessage = 'An account with this email already exists. Please use a different email or try logging in.'
        } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
          errorMessage = 'Please check your information and try again.'
        }
        
        throw new Error(errorMessage)
      }

      success('Account created successfully! Please log in.')
      
      // Navigate to login page without auto-login
      navigate('/login')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Signup Form */}
      <div className="flex-1 flex flex-col">
        {/* Top Header - Back Button and Logo */}
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-between">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center w-9 h-9 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            
            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-lg shadow-md border border-gray-100 px-4 py-2">
                <Logo size="badge" />
              </div>
            </div>
            
            <div className="w-9"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Signup Form - Centered */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-4 py-8">
          <div className="max-w-2xl w-full">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Create Account
              </h1>
              <p className="text-sm text-gray-600">
                Join us to start analyzing contracts with AI
              </p>
            </div>
            
            {/* Signup Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {/* 2-1-2 Layout for Form Fields */}
                <div className="space-y-4">
                  {/* Row 1: Full Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name Input */}
                    <div className="relative">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                        <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all duration-200"
                          placeholder="Enter your email"
                        />
                        <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Department (full width) */}
                  <div className="relative">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all duration-200 bg-white"
                    >
                      <option value="">Select your department</option>
                      <option value="Legal">Legal</option>
                      <option value="HR">Human Resources</option>
                      <option value="Sales">Sales</option>
                      <option value="Finance">Finance</option>
                      <option value="Procurement">Procurement</option>
                      <option value="Operations">Operations</option>
                      <option value="IT">IT</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Row 3: Password and Confirm Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password Input */}
                    <div className="relative">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all duration-200"
                          placeholder="Create a password"
                        />
                        <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all duration-200"
                          placeholder="Confirm your password"
                        />
                        <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex justify-center items-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="font-medium text-brand-600 hover:text-brand-500 transition-colors duration-200"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Features Preview */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full px-16 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-6">
              Transform Your Contract Analysis
            </h2>
            <p className="text-xl text-brand-100 leading-relaxed mb-8">
              Leverage the power of AI to analyze contracts, assess risks, and make informed decisions with confidence.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-8">
            <div className="flex items-center text-white">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI-Powered Analysis</h3>
                <p className="text-brand-100">Advanced contract analysis using cutting-edge AI</p>
              </div>
            </div>
            
            <div className="flex items-center text-white">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Risk Assessment</h3>
                <p className="text-brand-100">Comprehensive risk evaluation and scoring</p>
              </div>
            </div>
            
            <div className="flex items-center text-white">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Smart Insights</h3>
                <p className="text-brand-100">Detailed reports and actionable recommendations</p>
              </div>
            </div>
            
            <div className="flex items-center text-white">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Performance Tracking</h3>
                <p className="text-brand-100">Monitor and track contract performance metrics</p>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">99%</div>
              <div className="text-brand-100">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10x</div>
              <div className="text-brand-100">Faster</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-brand-100">Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage