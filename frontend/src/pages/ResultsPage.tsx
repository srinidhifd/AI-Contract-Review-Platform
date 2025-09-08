import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { contractService } from '../services/contractService'
import RiskChart from '../components/RiskChart'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Download,
  TrendingUp,
  FileText,
  Shield,
  BarChart3,
  PieChart,
  MessageSquare,
  Loader2,
  Sparkles,
  Bot,
  Calendar,
  Zap
} from 'lucide-react'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ContractAnalysis } from '../types'
import { getRiskLevel } from '../utils'
import UnifiedNavigationLink from '../components/UnifiedNavigationLink'

const ResultsPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>()
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')



  // Simple fallback to test if component is rendering
  if (!analysisId) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis ID</h3>
          <p className="text-gray-600">Please provide a valid analysis ID.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (analysisId) {
      loadAnalysis(analysisId)
    }
  }, [analysisId])

  const loadAnalysis = async (id: string) => {
    try {

      const data = await contractService.getAnalysis(id)
      
      setAnalysis(data)
    } catch (err) {
      console.error('Error loading analysis:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-700 bg-red-100 border-red-200'
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'low':
        return 'text-green-700 bg-green-100 border-green-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getRiskDistribution = () => {
    if (!analysis) return { high: 0, medium: 0, low: 0 }
    
    const distribution = { high: 0, medium: 0, low: 0 }
    
    // Check if risk_assessments exists and is an array
    const riskAssessments = analysis.risk_assessments || []
    if (Array.isArray(riskAssessments)) {
      riskAssessments.forEach(assessment => {
        const severity = assessment.severity?.toLowerCase()
        if (severity === 'high') distribution.high++
        else if (severity === 'medium') distribution.medium++
        else if (severity === 'low') distribution.low++
      })
    }
    
    return distribution
  }

  const formatRiskScore = (score: number) => {
    // Handle both old 0-1 scale and new 0-100 scale
    if (score <= 1) {
      return (score * 100).toFixed(1)
    }
    return score.toFixed(1)
  }

  const handleExport = (type: 'pdf' | 'excel') => {
    if (!analysis) return;
    const report = {
      title: `Contract Analysis Report - ${analysis.filename}`,
      date: new Date(analysis.upload_date).toLocaleDateString(),
      overallRiskScore: (analysis.risk_score || 0).toFixed(1),
      totalClauses: analysis.total_clauses || 0,
      keyPoints: analysis.key_points || [],
      riskAssessments: analysis.risk_assessments || [],       
      suggestedRevisions: analysis.suggested_revisions || []
    };
    if (type === 'pdf') {
      const input = document.getElementById('analysis-content');
      if (input) {
        // Temporarily show the hidden container for capture
        input.style.display = 'block';
        
        html2canvas(input, { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          scrollY: 0,
          height: input.scrollHeight,
          backgroundColor: '#ffffff'
        }).then(canvas => {
          // Hide the container again
          input.style.display = 'none';
          
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = pageWidth - 40;
          const imgHeight = canvas.height * imgWidth / canvas.width;
          
          // Calculate how many pages we need
          const pagesNeeded = Math.ceil(imgHeight / (pageHeight - 40));
          
          for (let i = 0; i < pagesNeeded; i++) {
            if (i > 0) {
              pdf.addPage();
            }
            
            const sourceY = i * (pageHeight - 40) * canvas.width / imgWidth;
            const sourceHeight = Math.min((pageHeight - 40) * canvas.width / imgWidth, canvas.height - sourceY);
            
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = sourceHeight;
            
            if (tempCtx) {
              tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
              const pageImgData = tempCanvas.toDataURL('image/png');
              pdf.addImage(pageImgData, 'PNG', 20, 20, imgWidth, sourceHeight * imgWidth / canvas.width);
            }
          }
          
          pdf.save(`${analysis.filename.replace(/\.[^/.]+$/, '')}_analysis_report.pdf`);
        }).catch(error => {
          // Hide the container in case of error
          input.style.display = 'none';
          console.error('PDF generation failed:', error);
        });
      }
    } else if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet([
        { Title: report.title, Date: report.date, 'Overall Risk Score': report.overallRiskScore, 'Total Clauses': report.totalClauses }
      ]);
      const ws2 = XLSX.utils.json_to_sheet(report.keyPoints.map((k: string, i: number) => ({ 'Key Point #': i + 1, 'Key Point': k })));
      const ws3 = XLSX.utils.json_to_sheet(report.riskAssessments.map((r: any, i: number) => ({ 'Clause #': i + 1, 'Risk Level': r.severity || r.risk_level, 'Description': r.description, 'Original Clause': r.original_clause || r.clause_text, 'AI Suggestion': r.ai_suggestion || r.suggestion })));
      const ws4 = XLSX.utils.json_to_sheet(report.suggestedRevisions.map((s: string, i: number) => ({ 'Revision #': i + 1, 'Suggestion': s })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Summary');
      XLSX.utils.book_append_sheet(wb, ws2, 'Key Points');
      XLSX.utils.book_append_sheet(wb, ws3, 'Risk Assessments');
      XLSX.utils.book_append_sheet(wb, ws4, 'Suggested Revisions');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${analysis.filename.replace(/\.[^/.]+$/, '')}_analysis_report.xlsx`);
    }
  };

  if (loading) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Analysis Results</h3>
          <p className="text-gray-600">Processing your contract analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The requested analysis could not be found.'}</p>
          <Link to="/contracts" className="inline-flex items-center px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Link>
        </div>
      </div>
    )
  }

  const riskDistribution = getRiskDistribution()
      const riskScore = analysis.risk_score || 0
    const riskInfo = getRiskLevel(riskScore)



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* PDF Export Container - Hidden but used for PDF generation */}
      <div id="analysis-content" className="space-y-6 bg-white p-8" style={{ display: 'none' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
            <p className="mt-1 text-sm text-gray-500">
              {analysis.filename} • {new Date(analysis.upload_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(analysis.analysis_status)}`}>
              {analysis.analysis_status}
            </span>
          </div>
        </div>

        {/* Risk Score Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Risk Score */}
          <div className="card md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Risk Assessment</h2>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">Overall Risk Score</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-4xl font-bold text-gray-900">
                  {formatRiskScore(riskScore)}/100
                </div>
                <div className="text-sm text-gray-500">
                  {analysis.total_clauses || 0} clauses analyzed
                </div>
              </div>
              <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(#ef4444 0deg ${(riskScore / 100) * 360}deg, #e5e7eb ${(riskScore / 100) * 360}deg 360deg)`
                  }}
                >
                  <span className="text-white text-3xl font-extrabold drop-shadow-md" style={{textShadow: '0 1px 4px rgba(0,0,0,0.4)'}}>
                    {formatRiskScore(riskScore)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Distribution Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 text-brand-600 mr-2" />
              Risk Distribution
            </h3>
            <RiskChart 
              high={riskDistribution.high}
              medium={riskDistribution.medium}
              low={riskDistribution.low}
            />
          </div>
        </div>

        {/* Key Points */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 text-brand-600 mr-2" />
            Key Points
          </h2>
          <div className="space-y-3">
            {(analysis.key_points || []).map((point: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-brand-600 rounded-full mt-2" />
                <p className="text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessments */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-brand-600 mr-2" />
            Risk Assessments
          </h2>
          <div className="space-y-4">
            {(analysis.risk_assessments || []).map((assessment: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(assessment.risk_level || assessment.severity)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(assessment.risk_level || assessment.severity)}`}>
                      {(assessment.risk_level || assessment.severity || 'UNKNOWN').toUpperCase()} RISK
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Issue</h4>
                    <p className="text-sm text-gray-700">{assessment.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Original Clause</h4>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-700 font-mono">{assessment.original_clause || 'No clause text available'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">AI Suggestion</h4>
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-sm text-green-700">{assessment.ai_suggestion || 'No suggestion available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Revisions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 text-brand-600 mr-2" />
            Suggested Revisions
          </h2>
          <div className="space-y-3">
            {(analysis.suggested_revisions || []).map((revision: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-brand-50 border border-brand-200 rounded-md">
                <Shield className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-brand-700">{revision}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visible Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                 <Link to="/contracts" className="text-gray-400 hover:text-brand-600 transition-colors p-3 rounded-xl hover:bg-brand-50">
                  <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Results</h1>
                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand-600" />
                      <span className="font-medium">{analysis.filename}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-brand-600" />
                      <span>{new Date(analysis.upload_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${riskInfo.bg} ${riskInfo.color}`}>
                <Shield className="h-4 w-4 mr-2" />
                {riskInfo.level}
              </div>
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                {analysis.analysis_status}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score Overview */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Risk Score */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-200 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-brand-600" />
                </div>
                Risk Assessment
              </h2>
              <div className="flex items-center gap-2 bg-brand-50 px-3 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <span className="text-sm font-medium text-brand-700">AI-Powered Analysis</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-6xl font-black text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {formatRiskScore(riskScore)}/100
                  </div>
                  <div className="text-base text-gray-600 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-brand-600" />
                    <span className="font-medium">{analysis.total_clauses || 0} clauses analyzed</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-8 border-gray-100 flex items-center justify-center shadow-2xl">
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center shadow-xl"
                    style={{
                      background: `conic-gradient(#ef4444 0deg ${(riskScore / 100) * 360}deg, #e5e7eb ${(riskScore / 100) * 360}deg 360deg)`
                    }}
                  >
                    <span className="text-white text-3xl font-black drop-shadow-lg" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
                      {formatRiskScore(riskScore)}
                    </span>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Risk Distribution Chart */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center">
                <PieChart className="h-4 w-4 text-brand-600" />
              </div>
              Risk Distribution
            </h3>
            <RiskChart 
              high={riskDistribution.high}
              medium={riskDistribution.medium}
              low={riskDistribution.low}
            />
          </div>
        </div>

        {/* Key Points */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <FileText className="h-5 w-5 text-brand-600 mr-2" />
            Key Points
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(analysis.key_points || []).map((point: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex-shrink-0 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessments */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 text-brand-600 mr-2" />
            Risk Assessments
          </h2>
          <div className="space-y-6">
            {(analysis.risk_assessments || []).map((assessment: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getRiskIcon(assessment.risk_level || assessment.severity)}
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRiskColor(assessment.risk_level || assessment.severity)}`}>
                      {(assessment.risk_level || assessment.severity || 'UNKNOWN').toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">Clause #{index + 1}</div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Issue Description</h4>
                    <p className="text-gray-700 leading-relaxed">{assessment.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Original Clause</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700 font-mono leading-relaxed">{assessment.original_clause || 'No clause text available'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">AI Suggestion</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-700 leading-relaxed">{assessment.ai_suggestion || 'No suggestion available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Revisions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Shield className="h-5 w-5 text-brand-600 mr-2" />
            Suggested Revisions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(analysis.suggested_revisions || []).map((revision: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-brand-50 border border-brand-200 rounded-xl hover:bg-brand-100 transition-colors">
                <div className="flex-shrink-0 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 text-white" />
                </div>
                <p className="text-sm text-brand-700 leading-relaxed">{revision}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <Link to="/analyze" className="btn btn-secondary flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Analyze Another Contract
            </Link>
            <div className="flex gap-3">
              <Link 
                to={`/chat/${analysis.id}`} 
                className="btn btn-primary flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" /> 
                Ask Questions
              </Link>
              <button onClick={() => handleExport('pdf')} className="btn btn-primary flex items-center gap-2">
                <Download className="h-4 w-4" /> 
                Export PDF
              </button>
              <button onClick={() => handleExport('excel')} className="btn btn-primary flex items-center gap-2">
                <Download className="h-4 w-4" /> 
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Cross-feature suggestion */}
        {analysis && analysis.upload_purpose === 'analysis' && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Want to ask questions about this document?
                </h3>
                <p className="text-gray-600 mb-4">
                  You can now chat with this document to get instant answers about clauses, terms, and conditions.
                </p>
                <UnifiedNavigationLink
                  documentId={analysis.id}
                  targetPurpose="chat"
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chatting
                </UnifiedNavigationLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsPage 