// Shared style utilities for consistent UI
// This helps maintain design consistency across components

export const buttonStyles = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors',
  ghost: 'hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors',
  link: 'text-brand-600 hover:text-brand-700 font-semibold underline'
}

export const cardStyles = {
  default: 'bg-white rounded-xl border border-gray-200 shadow-sm',
  hover: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300',
  elevated: 'bg-white rounded-xl border border-gray-200 shadow-lg',
  interactive: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer'
}

export const inputStyles = {
  default: 'w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all',
  search: 'w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all',
  error: 'w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all'
}

export const badgeStyles = {
  default: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  large: 'inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold'
}

export const riskStyles = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-green-600 bg-green-50 border-green-200'
}

export const layoutStyles = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8',
  pageHeader: 'mb-8',
  grid: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
}

export const animationStyles = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse'
}

// Utility function to combine styles
export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Risk-specific style getters
export const getRiskBadgeStyle = (score: number): string => {
  if (score >= 70) return `${badgeStyles.default} ${riskStyles.high}`
  if (score >= 30) return `${badgeStyles.default} ${riskStyles.medium}`
  return `${badgeStyles.default} ${riskStyles.low}`
}

export const getRiskCardStyle = (score: number): string => {
  const baseStyle = cardStyles.default
  if (score >= 70) return `${baseStyle} border-red-200`
  if (score >= 30) return `${baseStyle} border-yellow-200`
  return `${baseStyle} border-green-200`
}