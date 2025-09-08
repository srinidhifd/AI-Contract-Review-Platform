import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Send,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Bot,
  User,
  FileText,
  Sparkles,
  MessageSquare,
  Mic,
  MicOff,
  ArrowLeft,
  Shield,
  BarChart3,
  Calendar,
  Lightbulb
} from 'lucide-react'
import { ContractAnalysis, ChatMessage } from '../types'
import { formatTime, formatDate, formatMessageContent, getRiskLevel } from '../utils'
import { contractService } from '../services/contractService'
import { useToaster } from '../context/ToasterContext'

const ChatWithDocPage: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>()
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [availableContracts, setAvailableContracts] = useState<ContractAnalysis[]>([])
  const [messageStatus, setMessageStatus] = useState<string>('')
  
  // Voice recognition
  const [isRecording, setIsRecording] = useState(false)
  const recognition = useRef<any>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { error: showError } = useToaster()

  // Business-focused question suggestions
  const businessSuggestions = [
    {
      category: "Risk & Liability",
      icon: Shield,
      color: "text-red-600 bg-red-50 border-red-200",
      questions: [
        "What are the main risks in this contract?",
        "Are there any liability caps or limitations?", 
        "What happens if we breach this contract?",
        "Are there any penalty clauses?"
      ]
    },
    {
      category: "Payment & Money",
      icon: BarChart3,
      color: "text-green-600 bg-green-50 border-green-200", 
      questions: [
    "What are the payment terms?",
        "When are payments due?",
        "Are there any late payment penalties?",
        "What currency is this contract in?"
      ]
    },
    {
      category: "Timeline & Duration",
      icon: Calendar,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      questions: [
        "When does this contract start and end?",
    "How can this contract be terminated?",
        "What is the notice period for termination?",
        "Are there any renewal clauses?"
      ]
    },
    {
      category: "General Terms",
      icon: FileText,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      questions: [
        "Summarize the key points of this contract",
        "What are the main obligations of each party?",
        "Are there any confidentiality requirements?",
        "What governing law applies?"
      ]
    }
  ]

  // Load chat history from database
  useEffect(() => {
    if (contractId) {
      loadChatHistory()
      loadAnalysis()
    }
  }, [contractId])

  const loadChatHistory = async () => {
    if (!contractId) return
    
    try {
      console.log('Loading chat history for contract:', contractId)
      setMessageStatus('Loading chat history...')
      const chatHistory = await contractService.getChatHistory(contractId)
      console.log('Chat history loaded:', chatHistory)
      
      // Convert database format to ChatMessage format
      const formattedMessages: ChatMessage[] = []
      chatHistory.forEach((msg: any) => {
        console.log('Processing message:', msg)
        // Only add messages that have content
        if (msg.message_type === 'user' && msg.message) {
          formattedMessages.push({
            id: `user-${msg.id}`,
            type: 'user',
            content: msg.message,
            timestamp: new Date(msg.timestamp)
          })
        }
        if (msg.message_type === 'assistant' && msg.response) {
          formattedMessages.push({
            id: `ai-${msg.id}`,
            type: 'ai',
            content: msg.response,
            timestamp: new Date(msg.timestamp)
          })
        }
      })
      
      console.log('Formatted messages:', formattedMessages)
      setMessages(formattedMessages)
      if (formattedMessages.length > 0) {
        setShowSuggestions(false)
      }
      setMessageStatus('')
    } catch (error) {
      console.error('Failed to load chat history:', error)
      setError('Failed to load chat history')
      setMessageStatus('')
    }
  }

  // Fetch available contracts for dropdown
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contracts = await contractService.listAnalyses()
        setAvailableContracts(contracts.filter(c => c.analysis_status === 'completed'))
      } catch (err) {
        console.error('Failed to fetch contracts:', err)
      }
    }
    fetchContracts()
  }, [])

  // Database storage is handled in submitQuestion function

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = false
      recognition.current.interimResults = false
      recognition.current.lang = 'en-US'

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuestion(transcript)
        setIsRecording(false)
      }

      recognition.current.onend = () => {
        setIsRecording(false)
      }

      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        showError('Voice recognition failed. Please try again.')
      }
    }
  }, [showError])

  const startRecording = () => {
    if (recognition.current) {
      setIsRecording(true)
      recognition.current.start()
    } else {
      showError('Voice recognition is not supported in your browser.')
    }
  }

  const stopRecording = () => {
    if (recognition.current) {
      recognition.current.stop()
    }
    setIsRecording(false)
  }

  const loadAnalysis = async () => {
    if (!contractId) return
    
    try {
      setLoadingAnalysis(true)
      const data = await contractService.getAnalysis(contractId)
      setAnalysis(data)
    } catch (err) {
      console.error('Failed to load analysis:', err)
      setError('Failed to load contract analysis')
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const getRiskIcon = (score: number) => {
    if (score >= 70) return AlertTriangle
    if (score >= 30) return Clock  
    return CheckCircle
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !contractId) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setQuestion('')
    setLoading(true)
    setError('')
    setShowSuggestions(false)
    setMessageStatus('Sending message...')

    try {
      console.log('Sending question:', question, 'to contract:', contractId)
      setMessageStatus('Getting AI response...')
      const response = await contractService.askQuestion(question, contractId)
      console.log('Chat response received:', response)
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response || '',
        timestamp: new Date(),
        relevant_sections: response.relevant_sections,
        page_references: response.page_references
      }

      setMessages(prev => [...prev, aiMessage])
      setMessageStatus('Message saved!')
      setTimeout(() => setMessageStatus(''), 2000)
    } catch (err) {
      let errorMessage = 'Failed to get answer'
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase()
        if (message.includes('overloaded') || message.includes('rate limit') || message.includes('temporarily')) {
          errorMessage = '🤖 AI is currently busy! Please wait a moment and try again. Our AI is working hard to help everyone.'
        } else if (message.includes('network') || message.includes('fetch')) {
          errorMessage = '🌐 Connection issue. Please check your internet and try again.'
        } else if (message.includes('timeout')) {
          errorMessage = '⏱️ Request timed out. The AI is taking longer than usual. Please try again.'
        } else if (message.includes('unauthorized') || message.includes('401')) {
          errorMessage = '🔐 Authentication issue. Please refresh the page and try again.'
        } else {
          errorMessage = `❌ ${err.message}`
        }
      }
      
      setError(errorMessage)
      setMessageStatus('Error occurred')
      setTimeout(() => setMessageStatus(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion)
    setShowSuggestions(false)
  }

  if (!contractId) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-3">No Document Selected</h2>
          <p className="text-gray-600 mb-6">Please select a document from your analyzed contracts to start chatting.</p>
          <Link to="/contracts" className="btn btn-primary">
            View Your Contracts
          </Link>
        </div>
      </div>
    )
  }

  if (loadingAnalysis) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your contract...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contract Not Found</h2>
          <p className="text-gray-600 mb-6">The selected contract could not be loaded. It may have been deleted or you don't have access to it.</p>
              <Link to="/contracts" className="btn btn-primary">
            Back to Contracts
              </Link>
        </div>
      </div>
    )
  }

              const riskScore = analysis.risk_score || 0
            const riskInfo = getRiskLevel(riskScore)

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link 
                to="/contracts"
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to contracts"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </Link>
              <div className="w-8 h-8 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Chat with Contract</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Contract Selection */}
              {availableContracts.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">Contract:</span>
                  <select
                    value={contractId || ''}
                    onChange={(e) => navigate(`/chat/${e.target.value}`)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-transparent bg-white min-w-[150px]"
                  >
                    {availableContracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.filename}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Document Info and Risk Badge */}
              <div className="flex items-center gap-3">
                {/* Document Info */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <FileText className="h-3 w-3" />
                  <span className="font-medium">{analysis.filename}</span>
                  <span>•</span>
                  <BarChart3 className="h-3 w-3" />
                  <span>{analysis.total_clauses || 0} clauses</span>
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(analysis.upload_date)}</span>
                </div>

                {/* Minimized Risk Badge */}
                {riskInfo && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${riskInfo.bg} ${riskInfo.color}`}>
                      {React.createElement(getRiskIcon(riskScore), { className: "h-3 w-3 mr-1" })}
                      {riskInfo.level}
                    </div>
                    <span className="text-xs font-medium text-gray-600">{riskScore.toFixed(1)}/100</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>


      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {showSuggestions && messages.length === 0 ? (
            /* Business-Focused Suggestions */
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">What would you like to know?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Ask questions about your contract in plain English. Our AI will help you understand the terms, risks, and obligations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {businessSuggestions.map((category, index) => (
                  <div key={index} className={`rounded-2xl border-2 p-6 ${category.color}`}>
                    <div className="flex items-center mb-4">
                      <category.icon className="h-6 w-6 mr-3" />
                      <h3 className="font-semibold text-gray-900">{category.category}</h3>
            </div>
                    <div className="space-y-2">
                      {category.questions.map((q, idx) => (
                <button
                          key={idx}
                          onClick={() => handleSuggestionClick(q)}
                          className="block w-full text-left text-sm text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg px-3 py-2 transition-colors"
                        >
                          "{q}"
                </button>
              ))}
            </div>
          </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
                    <p className="text-blue-800 text-sm">
                      Start with "What are the main risks?" to get a quick overview, then ask specific questions about terms you're concerned about.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'ai' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-brand-600" />
                        </div>
                      )}
                      
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                    <div className={`rounded-2xl px-6 py-4 ${
                      message.type === 'user' 
                        ? 'bg-brand-600 text-white' 
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}>
                      <div className={`${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>
                        {message.type === 'ai' ? (
                          <div dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content || '') }} />
                        ) : (
                          <p>{message.content || ''}</p>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 mt-2 text-xs text-gray-500 ${
                      message.type === 'user' ? 'justify-end' : 'justify-end'
                    }`}>
                      <span>{formatTime(message.timestamp)}</span>
                          </div>
                        </div>

                  {message.type === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center flex-shrink-0 order-2 shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

          {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-brand-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                      <span className="text-gray-600">Analyzing your question...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium mb-1">Something went wrong</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
              </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        </div>

      {/* Enhanced Input Area - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 px-4 py-1.5 z-10 lg:left-16">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <div className="flex-1 relative w-full">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about your contract..."
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white shadow-sm"
                disabled={loading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {question.length > 0 && (
                  <span className="text-xs text-gray-400">{question.length}</span>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2 w-full sm:w-auto"
              >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
            </div>
          </form>
          
                     {/* Status Bar */}
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1 text-xs text-gray-500">
             <div className="flex items-center gap-4">
               {isRecording && (
                 <div className="flex items-center gap-2 text-red-500">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                   <span>Recording...</span>
                 </div>
               )}
               {messageStatus && (
                 <div className="flex items-center gap-2 text-blue-500">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                   <span>{messageStatus}</span>
                 </div>
               )}
               <span className="hidden sm:inline">💡 Ask specific questions for better answers</span>
             </div>
             <div className="flex items-center gap-2">
               <span>Powered by AI</span>
               <Sparkles className="h-3 w-3" />
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default ChatWithDocPage 