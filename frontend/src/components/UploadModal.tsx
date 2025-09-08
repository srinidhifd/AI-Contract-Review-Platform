import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Loader2,
  Info,
  AlertTriangle,
  X,
  ArrowRight
} from 'lucide-react'
import { contractService } from '../services/contractService'
import { useToaster } from '../context/ToasterContext'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: (documentId: string) => void
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [existingDocument, setExistingDocument] = useState<any>(null)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const { success, error: showError } = useToaster()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setFile(null)
      setUploading(false)
      setAnalyzing(false)
      setAnalysisError(null)
      setUploadedDocumentId(null)
      setDragActive(false)
      setExistingDocument(null)
      setShowDuplicateDialog(false)
    }
  }, [isOpen])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  const handleRetryAnalysis = async () => {
    if (!uploadedDocumentId) return
    
    setAnalysisError(null)
    setAnalyzing(true)
    
    try {
      await contractService.triggerAnalysis(uploadedDocumentId)
      success('Analysis completed successfully! Your document is ready for review.')
      
      // Close modal and refresh contracts list
      onClose()
      if (onUploadComplete) {
        onUploadComplete(uploadedDocumentId)
      }
    } catch (analysisError) {
      console.error('Retry analysis failed:', analysisError)
      
      // Handle 404 error - document was deleted due to previous analysis failure
      if (analysisError instanceof Error && analysisError.message.includes('404')) {
        setAnalysisError('Document was removed due to analysis failure. Please upload the file again.')
        setUploadedDocumentId(null)
        setFile(null)
      } else {
        const errorMessage = analysisError instanceof Error ? analysisError.message : 'Analysis failed. Please try again.'
        setAnalysisError(errorMessage)
        showError(errorMessage)
      }
    } finally {
      setAnalyzing(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setAnalysisError(null)
    try {
      const response = await contractService.uploadDocument(file)
      
      // Check if this is a duplicate document scenario
      if (response.existing_document) {
        setExistingDocument(response.existing_document)
        setShowDuplicateDialog(true)
        setUploading(false)
        return
      }
      
      success('Document uploaded successfully! Starting analysis...')
      
      // Store the document ID for retry functionality
      const documentId = response.document_id || response.id
      setUploadedDocumentId(documentId)
      
      // Start analysis phase
      setUploading(false)
      setAnalyzing(true)
      
      // Trigger analysis after upload
      try {
        await contractService.triggerAnalysis(documentId)
        success('Analysis completed successfully! Your document is ready for review.')
        
        // Close modal and refresh contracts list only after successful analysis
        onClose()
        if (onUploadComplete) {
          onUploadComplete(documentId)
        }
      } catch (analysisError) {
        console.error('Analysis failed:', analysisError)
        
        // Handle 404 error - document was deleted due to analysis failure
        if (analysisError instanceof Error && analysisError.message.includes('404')) {
          setAnalysisError('Document was removed due to analysis failure. Please upload the file again.')
          setUploadedDocumentId(null)
          setFile(null)
        } else {
          const errorMessage = analysisError instanceof Error ? analysisError.message : 'Analysis failed. Please try again.'
          setAnalysisError(errorMessage)
          showError(errorMessage)
        }
        
        // Keep modal open if analysis fails so user can retry
        setAnalyzing(false)
        return
      } finally {
        setAnalyzing(false)
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleUseCrossPurpose = async () => {
    if (!existingDocument) return
    
    setUploading(true)
    try {
      const targetPurpose = existingDocument.requested_purpose
      
      // With single document, multiple purposes - just use the same document ID
      const targetDocumentId = existingDocument.id
      
      if (targetPurpose === 'chat') {
        success('Document ready for chat! Starting chat...')
        onClose()
        navigate(`/chat/${targetDocumentId}`)
      } else {
        success('Document ready for analysis!')
        onClose()
        if (onUploadComplete) {
          onUploadComplete(targetDocumentId)
        } else {
          navigate(`/results/${targetDocumentId}`)
        }
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to use existing document')
    } finally {
      setUploading(false)
      setShowDuplicateDialog(false)
      setExistingDocument(null)
    }
  }

  const handleNavigateToExisting = () => {
    if (!existingDocument) return
    
    onClose()
    
    if (existingDocument.existing_purpose === 'chat') {
      navigate(`/chat/${existingDocument.id}`)
    } else {
      navigate(`/results/${existingDocument.id}`)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const config = {
    title: 'Upload Contract Document',
    subtitle: 'Upload your contract for analysis and chat',
    buttonText: 'Upload Document',
    buttonIcon: FileText,
    color: 'brand'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Duplicate Document Dialog */}
        {showDuplicateDialog && existingDocument ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Document Already Exists</h2>
                  <p className="text-sm text-gray-600">This document is already in your {existingDocument.existing_purpose} section</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{existingDocument.filename}</p>
                    <p className="text-sm text-gray-600">
                      Currently in: <span className="font-medium text-brand-600">{existingDocument.existing_purpose}</span>
                      {existingDocument.risk_score && (
                        <> • Risk Score: <span className="font-medium">{existingDocument.risk_score}/100</span></>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">What would you like to do?</h3>
                
                {/* Option 1: Use for new purpose */}
                <div className="border border-brand-200 rounded-xl p-4 bg-brand-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center mt-0.5">
                      <ArrowRight className="h-4 w-4 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        Add to {existingDocument.requested_purpose} (Recommended)
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Use this document for {existingDocument.requested_purpose} while keeping it in {existingDocument.existing_purpose} as well
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Option 2: Go to existing */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-0.5">
                      <FileText className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        Go to existing {existingDocument.existing_purpose}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Navigate to where this document already exists
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 space-y-4">
              {/* Primary Action - Add to new purpose */}
              <button
                onClick={handleUseCrossPurpose}
                disabled={uploading || analyzing}
                className="w-full px-6 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {uploading || analyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5" />
                    Add to {existingDocument.requested_purpose} (Recommended)
                  </>
                )}
              </button>
              
              {/* Secondary Action - Go to existing */}
              <button
                onClick={handleNavigateToExisting}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-3"
              >
                <FileText className="h-5 w-5" />
                Go to existing {existingDocument.existing_purpose}
              </button>
            </div>
            
            {/* Footer */}
            <div className="p-6 pt-0 border-t border-gray-200">
              <button
                onClick={() => setShowDuplicateDialog(false)}
                className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Original Upload Modal Content */}
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br from-${config.color}-100 to-${config.color}-200 rounded-xl flex items-center justify-center`}>
              <config.buttonIcon className={`h-5 w-5 text-${config.color}-600`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
              <p className="text-sm text-gray-600">{config.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? `border-${config.color}-400 bg-${config.color}-50`
                : file
                ? 'border-green-400 bg-green-50'
                : `border-gray-300 hover:border-${config.color}-400 hover:bg-${config.color}-50/50`
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".txt,.docx,.pdf"
              onChange={handleFileInput}
            />

            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      analyzing ? 'bg-blue-100' : uploading ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      {analyzing ? (
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      ) : uploading ? (
                        <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 truncate">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {
                          analyzing ? 'Analyzing document...' : 
                          uploading ? 'Uploading...' : 
                          'Ready to upload'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mx-auto">
                  <Upload className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Drop Your Document Here
                  </p>
                  <p className="text-gray-600 mt-1">
                    Or <span className="text-brand-600 font-medium underline cursor-pointer">click to browse</span> from your device
                  </p>
                </div>
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>TXT, DOCX, PDF</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Info className="h-4 w-4" />
                    <span>Up to 10MB</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Analysis Error Message */}
            {analysisError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <X className="h-3 w-3 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Analysis Failed</p>
                    <p className="text-sm text-red-700 mt-1">{analysisError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={analysisError ? handleRetryAnalysis : handleUpload}
              disabled={!file || uploading || analyzing}
              className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : analysisError ? (
                <>
                  <config.buttonIcon className="h-4 w-4" />
                  Retry Analysis
                </>
              ) : (
                <>
                  <config.buttonIcon className="h-4 w-4" />
                  {config.buttonText}
                </>
              )}
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UploadModal