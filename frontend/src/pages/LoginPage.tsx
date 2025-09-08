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
  Shield, 
  FileText, 
 
  TrendingUp,
  Loader2
} from 'lucide-react'
import { ERROR_MESSAGES } from '../constants'
import { loginSchema, type LoginFormData } from '../utils/validation'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const { success, error: showError } = useToaster()
  const navigate = useNavigate()



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate form data with Zod
    const formData: LoginFormData = {
      email: email.trim(),
      password
    }

    try {
      loginSchema.parse(formData)
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
      await login(email, password)
      success('Successfully logged in!')
      navigate('/dashboard')
    } catch (err) {
      let errorMsg = err instanceof Error ? err.message : ERROR_MESSAGES.UNAUTHORIZED
      
      // Provide user-friendly error messages
      if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || errorMsg.includes('invalid')) {
        errorMsg = 'Invalid email or password. Please check your credentials and try again.'
      } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        errorMsg = 'No account found with this email. Please sign up first or check your email address.'
      } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
        errorMsg = 'Connection error. Please check your internet connection and try again.'
      }
      
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: FileText,
      title: 'AI-Powered Analysis',
      description: 'Advanced contract analysis using cutting-edge AI'
    },
    {
      icon: Shield,
      title: 'Risk Assessment',
      description: 'Comprehensive risk evaluation and scoring'
    },
    {
      icon: FileText,
      title: 'Smart Insights',
      description: 'Detailed reports and actionable recommendations'
    },
    {
      icon: TrendingUp,
      title: 'Performance Tracking',
      description: 'Monitor and track contract performance metrics'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col">
        {/* Top Header - Back Button and Logo */}
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
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

        {/* Login Form - Centered */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-4 py-8">
          <div className="max-w-lg w-full">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Welcome back
              </h1>
              <p className="text-sm text-gray-600">
                Sign in to your account to access your contract analysis dashboard
              </p>
            </div>
            
            {/* Login Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all duration-200"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all duration-200"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-red-100 rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                        </div>
                      </div>
                      <div className="ml-1.5">
                        <p className="text-xs text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex justify-center items-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>

                {/* Signup Link */}
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                      to="/signup" 
                      className="font-medium text-brand-600 hover:text-brand-500 transition-colors duration-200"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
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

        <div className="relative z-10 flex flex-col justify-between h-full px-10 py-8">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold text-white mb-5">
              Transform Your Contract Analysis
            </h2>
            <p className="text-lg text-brand-100 mb-6 leading-relaxed">
              Leverage the power of AI to analyze contracts, assess risks, and make informed decisions with confidence.
            </p>
            
            <div className="space-y-5">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-brand-100">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats - Bottom Section with Better Spacing */}
          <div className="max-w-lg">
            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/20">
              <div className="text-center">
                <div className="text-xl font-bold text-white">99%</div>
                <div className="text-xs text-brand-100">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">10x</div>
                <div className="text-xs text-brand-100">Faster</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">24/7</div>
                <div className="text-xs text-brand-100">Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 