import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'badge'
  className?: string
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
    badge: 'w-16 h-10'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg`}>
        <span className="text-center">
          <div className="text-xs font-light">AI</div>
          <div className="text-sm font-bold">Contract</div>
          <div className="text-xs font-light">Review</div>
        </span>
      </div>
    </div>
  )
}

export default Logo 