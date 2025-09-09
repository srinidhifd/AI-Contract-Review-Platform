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
        alt="AI Contract Review Platform"
        className={`${sizeClasses[size]} object-contain`}
        onError={(e) => {
          // Fallback to a text logo if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div class="${sizeClasses[size]} flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg">ACR</div>`;
          }
        }}
      />
    </div>
  )
}

export default Logo 