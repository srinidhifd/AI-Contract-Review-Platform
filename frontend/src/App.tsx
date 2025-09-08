import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ContractsPage from './pages/ContractsPage'
import ResultsPage from './pages/ResultsPage'
import ChatWithDocPage from './pages/ChatWithDocPage'

import ProfilePage from './pages/ProfilePage'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
      />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/contracts" 
        element={
          <ProtectedRoute>
            <Layout>
              <ContractsPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/results/:analysisId" 
        element={
          <ProtectedRoute>
            <Layout>
              <ResultsPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/chat/:contractId" 
        element={
          <ProtectedRoute>
            <Layout>
              <ChatWithDocPage />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App 