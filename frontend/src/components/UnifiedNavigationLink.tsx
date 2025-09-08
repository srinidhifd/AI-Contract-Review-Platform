import React from 'react'
import { Link } from 'react-router-dom'

interface UnifiedNavigationLinkProps {
  documentId: string
  targetPurpose: 'analysis' | 'chat'
  className?: string
  children: React.ReactNode
}

const UnifiedNavigationLink: React.FC<UnifiedNavigationLinkProps> = ({
  documentId,
  targetPurpose,
  className = '',
  children
}) => {
  // With single document, multiple purposes - just navigate to the same document ID
  const href = targetPurpose === 'analysis' ? `/results/${documentId}` : `/chat/${documentId}`
  
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}

export default UnifiedNavigationLink