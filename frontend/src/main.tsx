import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { AnalysisProvider } from './context/AnalysisContext'
import { ToasterProvider } from './context/ToasterContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <AnalysisProvider>
          <ToasterProvider>
            <App />
          </ToasterProvider>
        </AnalysisProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
) 