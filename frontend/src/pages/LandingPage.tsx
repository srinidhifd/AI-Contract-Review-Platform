import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { 
  Shield, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  ArrowRight,
  Star,
  Users,
  Clock,
  CheckCircle,
  Zap,
  Sparkles,
  Heart
} from 'lucide-react'

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Logo size="lg" />
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-blue-200/50 text-blue-700 text-sm font-semibold rounded-full mb-8 shadow-sm">
              <Star className="h-4 w-4 mr-2 text-blue-500" />
              Trusted by Sales, HR, and Finance Teams
            </div>
            
            {/* Main Headline */}
            <div className="space-y-6 mb-10">
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-none tracking-tight">
                Review Contracts Like a
              </h1>
              <div className="relative">
                <span className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent leading-none tracking-tight">
                  Legal Expert
                </span>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </div>
          </div>
            
            {/* Description */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Stop waiting for legal review. Get instant contract analysis and ask questions in plain English.<br />
              <span className="text-gray-800 font-medium">Perfect for sales, HR, and finance teams</span> who need quick, clear answers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link 
                to="/signup" 
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                Try It Free Now 
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-indigo-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm font-medium">Loved by 5,000+ professionals</span>
          </div>
        </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">Under 3 min</div>
                <div className="text-sm font-medium text-gray-600">Average Analysis Time</div>
              </div>
              <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
                <div className="text-sm font-medium text-gray-600">Accuracy Rate</div>
              </div>
              <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
                <div className="text-sm font-medium text-gray-600">Always Available</div>
              </div>
              <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">Zero</div>
                <div className="text-sm font-medium text-gray-600">Training Required</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="border-t border-gray-200/60"></div>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-6">
              Built for Business Teams
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Designed for 
              <span className="text-blue-600"> Non-Legal</span> Professionals
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Get quick, clear contract insights without legal expertise. Perfect for teams who need answers fast.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="group relative h-full">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl p-8 lg:p-10 border border-blue-200/50 hover:border-blue-300/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                  Ask Questions in Plain English
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg flex-grow">
                  No legal jargon needed. Simply ask 'What are the payment terms?' or 'When does this expire?' and get clear, instant answers from our AI legal expert.
                </p>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30 mt-auto">
                                          <p className="text-sm font-semibold text-blue-700 mb-2">Example Question:</p>
                  <p className="text-gray-700 italic font-medium">"What happens if we cancel early?"</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative h-full">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl p-8 lg:p-10 border border-emerald-200/50 hover:border-emerald-300/50 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                  Get Clear Risk Insights
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg flex-grow">
                  Understand what matters for your business decisions. Get simple risk scores with detailed explanations that anyone can understand, not just lawyers.
                </p>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-200/30 mt-auto">
                  <p className="text-sm font-semibold text-emerald-700 mb-2">📊 Example Insight:</p>
                  <p className="text-gray-700 italic font-medium">"Medium Risk: Payment terms favor vendor"</p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative h-full">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl p-8 lg:p-10 border border-purple-200/50 hover:border-purple-300/50 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                  Save Hours of Review Time
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg flex-grow">
                  Skip the back-and-forth with legal teams. Get comprehensive contract analysis and actionable insights in minutes, not days or weeks.
                </p>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-200/30 mt-auto">
                  <p className="text-sm font-semibold text-purple-700 mb-2">⚡ Time Saved:</p>
                  <p className="text-gray-700 italic font-medium">"Complete review in under 3 minutes"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="border-t border-gray-200/60"></div>

      {/* How It Works Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-blue-200/50 text-blue-700 text-sm font-semibold rounded-full mb-8 shadow-lg">
              <Zap className="h-4 w-4 mr-2" />
              Simple Process
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              How It <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Transform your contract review process in three simple steps. No training required.
            </p>
          </div>

          {/* Steps Container */}
          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden lg:block absolute top-32 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200"></div>
            
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              {/* Step 1 */}
              <div className="relative group">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative bg-white rounded-3xl p-10 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3">
                  {/* Step Number */}
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-105 transition-transform duration-500 relative overflow-hidden border-4 border-white">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      <span className="text-4xl font-black text-white relative z-10 drop-shadow-lg">1</span>
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <FileText className="h-9 w-9 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Upload Document</h3>
                    <p className="text-gray-600 leading-relaxed text-xl mb-10">
                      Securely upload your contract in any format. Our AI instantly processes and understands your document structure.
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-4 mb-10">
                      <div className="flex items-center justify-center gap-4 text-blue-700">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                        <span className="text-base font-semibold">PDF, Word, Text supported</span>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-blue-700">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                        <span className="text-base font-semibold">Bank-grade encryption</span>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-blue-700">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                        <span className="text-base font-semibold">Instant processing</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                      <p className="text-blue-800 font-bold text-base">⚡ Processed in under 10 seconds</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative bg-white rounded-3xl p-10 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3">
                  {/* Step Number */}
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-105 transition-transform duration-500 relative overflow-hidden border-4 border-white">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      <span className="text-4xl font-black text-white relative z-10 drop-shadow-lg">2</span>
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <MessageSquare className="h-9 w-9 text-emerald-600" />
                    </div>
                  </div>
                  
            <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">AI Analysis</h3>
                    <p className="text-gray-600 leading-relaxed text-xl mb-10">
                      Ask questions in plain English or request a full analysis. Our AI provides instant, accurate insights.
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-4 mb-10">
                      <div className="flex items-center justify-center gap-4 text-emerald-700">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                        <span className="text-base font-semibold">Natural language queries</span>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-emerald-700">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                        <span className="text-base font-semibold">Comprehensive risk analysis</span>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-emerald-700">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                        <span className="text-base font-semibold">Legal expertise built-in</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
                      <p className="text-emerald-800 font-bold text-base">🎯 99.9% accuracy rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative bg-white rounded-3xl p-10 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3">
                  {/* Step Number */}
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-105 transition-transform duration-500 relative overflow-hidden border-4 border-white">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      <span className="text-4xl font-black text-white relative z-10 drop-shadow-lg">3</span>
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle className="h-9 w-9 text-purple-600" />
                    </div>
            </div>
                  
            <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Smart Decisions</h3>
                    <p className="text-gray-600 leading-relaxed text-xl mb-10">
                      Get actionable recommendations with risk scores and next steps. Make confident business decisions.
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-4 mb-10">
                      <div className="flex items-center justify-center gap-4 text-purple-700">
                        <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                        <span className="text-base font-semibold">Risk scoring (0-100)</span>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-purple-700">
                        <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                        <span className="text-base font-semibold">Actionable recommendations</span>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-purple-700">
                        <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                        <span className="text-base font-semibold">Export reports</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                      <p className="text-purple-800 font-bold text-base">📊 Enterprise-ready insights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Process Flow */}
            <div className="mt-24 text-center">
              <div className="inline-flex items-center gap-10 bg-white/95 backdrop-blur-xl rounded-full px-16 py-8 shadow-2xl border border-gray-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg"></div>
                  <span className="text-xl font-bold text-gray-800">Upload</span>
                </div>
                <ArrowRight className="h-7 w-7 text-gray-400" />
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-lg"></div>
                  <span className="text-xl font-bold text-gray-800">Analyze</span>
                </div>
                <ArrowRight className="h-7 w-7 text-gray-400" />
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg"></div>
                  <span className="text-xl font-bold text-gray-800">Decide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="border-t border-gray-200/60"></div>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-600 text-sm font-semibold rounded-full mb-6">
              ⭐ Trusted by Professionals
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              What Our Users Say
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Real feedback from business professionals who've transformed their contract review process
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl p-8 border border-blue-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  S
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah Martinez</h4>
                  <p className="text-sm text-gray-600">Sales Director, TechFlow</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "I can now review vendor contracts myself without waiting for legal. <strong>Closed 3 deals faster this month!</strong> The AI explanations are so clear."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl p-8 border border-emerald-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  M
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                  <p className="text-sm text-gray-600">HR Manager, InnovateCorp</p>
                </div>
              </div>
              <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "Perfect for reviewing employment contracts. I understand exactly what each clause means for our company. <strong>Saved 15 hours last week alone.</strong>"
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl p-8 border border-purple-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  L
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Lisa Thompson</h4>
                  <p className="text-sm text-gray-600">Finance Director, GrowthCo</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "The risk insights are incredibly valuable for budgeting. <strong>Caught a liability issue that could have cost us $50K.</strong> Amazing tool!"
              </p>
            </div>
          </div>

          {/* Trust Stats */}
          <div className="mt-20 text-center">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">5,000+</div>
                <div className="text-sm text-gray-600 font-medium">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">50,000+</div>
                <div className="text-sm text-gray-600 font-medium">Contracts Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
                <div className="text-sm text-gray-600 font-medium">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-sm text-gray-600 font-medium">Would Recommend</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="border-t border-gray-200/60"></div>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          {/* Main CTA Content */}
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Ready to Review Contracts 
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Like a Pro?</span>
          </h2>
            <p className="text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light mb-12">
              Join thousands of professionals who've streamlined their contract review process.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                to="/signup" 
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-bold text-lg px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                Start Free Trial 
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="group border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 font-semibold text-lg px-12 py-4 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                Sign In
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
            </div>
          </div>

          {/* Enhanced Trust & Trial Section */}
          <div className="relative max-w-6xl mx-auto">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-indigo-50/30 to-blue-100/40 rounded-3xl blur-2xl"></div>
            
            {/* Main Content Container */}
            <div className="relative bg-gradient-to-br from-white/95 via-white/98 to-blue-50/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden">
              {/* Decorative Top Bar */}
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              
              <div className="p-12 lg:p-16">
                {/* Header Section */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 text-base font-bold rounded-full mb-8 border border-blue-200/50 shadow-lg backdrop-blur-sm">
                    <Sparkles className="h-5 w-5 mr-3 text-blue-600" />
                    Limited Time Offer
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    Start Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Free Trial</span>
                  </h3>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    No credit card required • Full access • Cancel anytime
                  </p>
                </div>

                {/* Trust Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <CheckCircle className="h-9 w-9 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">No Credit Card</h4>
                      <p className="text-gray-600 text-sm">Start immediately without any payment details</p>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Clock className="h-9 w-9 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">14-Day Trial</h4>
                      <p className="text-gray-600 text-sm">Full access to all premium features</p>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Heart className="h-9 w-9 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Cancel Anytime</h4>
                      <p className="text-gray-600 text-sm">No questions asked, no hidden fees</p>
                    </div>
                  </div>
                </div>

                {/* Trust Statistics */}
                <div className="bg-gradient-to-r from-slate-50/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/30">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">Trusted by Professionals Worldwide</h4>
                    <p className="text-gray-600">Join thousands of teams who've transformed their contract review process</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="text-center group">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-10 w-10 text-white" />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">5,000+</div>
                      <div className="text-sm text-gray-600 font-semibold">Happy Users</div>
                    </div>
                    
                    <div className="text-center group">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Star className="h-10 w-10 text-white" />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">4.9/5</div>
                      <div className="text-sm text-gray-600 font-semibold">Average Rating</div>
                    </div>
                    
                    <div className="text-center group">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Shield className="h-10 w-10 text-white" />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">100%</div>
                      <div className="text-sm text-gray-600 font-semibold">Secure</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16 lg:py-20">
            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center mb-6">
                  <Logo size="lg" />
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
                  Empowering business teams with instant contract insights. Making legal review accessible to everyone through advanced AI technology.
                </p>
                <div className="flex space-x-6">
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-300">
                    <span className="text-sm font-bold">in</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-300">
                    <span className="text-sm font-bold">tw</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-300">
                    <span className="text-sm font-bold">fb</span>
                  </a>
                </div>
            </div>

              {/* Product Links */}
            <div>
                <h3 className="text-white font-semibold text-lg mb-6">Product</h3>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2"><span>Chat with Documents</span></a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2"><span>Contract Analysis</span></a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2"><span>Risk Assessment</span></a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2"><span>API Access</span></a></li>
              </ul>
            </div>

              {/* Resources Links */}
            <div>
                <h3 className="text-white font-semibold text-lg mb-6">Resources</h3>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Tutorials</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Blog</a></li>
              </ul>
            </div>

              {/* Company Links */}
            <div>
                <h3 className="text-white font-semibold text-lg mb-6">Company</h3>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Contact</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Security</a></li>
              </ul>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-700 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 font-medium">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 font-medium">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 font-medium">
                  Cookie Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 font-medium">
                  GDPR Compliance
                </a>
              </div>
              <p className="text-gray-500 text-sm">
                © 2024 All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage 