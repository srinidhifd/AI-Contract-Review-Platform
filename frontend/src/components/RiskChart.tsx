import React from 'react'

interface RiskChartProps {
  high: number
  medium: number
  low: number
}

const RiskChart: React.FC<RiskChartProps> = ({ high, medium, low }) => {
  const total = high + medium + low
  
  if (total === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No risk data available
      </div>
    )
  }

  const highPercentage = (high / total) * 100
  const mediumPercentage = (medium / total) * 100
  const lowPercentage = (low / total) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Risk Distribution</span>
        <span className="text-sm text-gray-500">{total} total clauses</span>
      </div>
      
      <div className="space-y-3">
        {/* High Risk */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${highPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">{high}</span>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mediumPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">{medium}</span>
          </div>
        </div>

        {/* Low Risk */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${lowPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">{low}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-red-600">{highPercentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">High Risk</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">{mediumPercentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Medium Risk</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{lowPercentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Low Risk</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskChart 