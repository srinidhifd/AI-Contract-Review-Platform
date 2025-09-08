import React, { createContext, useContext, ReactNode } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface ToasterContextType {
  success: (message: string) => void
  error: (message: string) => void
  loading: (message: string) => void
  dismiss: () => void
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined)

export const useToaster = () => {
  const context = useContext(ToasterContext)
  if (context === undefined) {
    throw new Error('useToaster must be used within a ToasterProvider')
  }
  return context
}

interface ToasterProviderProps {
  children: ReactNode
}

export const ToasterProvider: React.FC<ToasterProviderProps> = ({ children }) => {
  const success = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#0d9488', // brand-600
        color: '#fff',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
        padding: '16px 20px',
        minWidth: '300px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
    })
  }

  const error = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#dc2626', // red-600
        color: '#fff',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
        padding: '16px 20px',
        minWidth: '300px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
    })
  }

  const loading = (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#0f766e', // brand-700
        color: '#fff',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
        padding: '16px 20px',
        minWidth: '300px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
    })
  }

  const dismiss = () => {
    toast.dismiss()
  }

  const value: ToasterContextType = {
    success,
    error,
    loading,
    dismiss,
  }

  return (
    <ToasterContext.Provider value={value}>
      {children}
      <Toaster />
    </ToasterContext.Provider>
  )
} 