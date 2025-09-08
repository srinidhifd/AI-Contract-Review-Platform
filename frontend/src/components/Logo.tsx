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
      <img 
        src="/images/version1-logo.png" 
        alt="Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  )
}

export default Logo 