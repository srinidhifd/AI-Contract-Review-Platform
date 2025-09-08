import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import { 
  BarChart3, 
  LogOut,
  Menu,
  X,
  FileText,
  User
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  // Keyboard shortcut for toggling sidebar (Ctrl/Cmd + B)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        setSidebarCollapsed(!sidebarCollapsed)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarCollapsed])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Contracts', href: '/contracts', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex flex-shrink-0 items-center justify-center px-6 py-3 border-b border-gray-200">
            <Logo size="lg" />
          </div>
          <nav className="flex-1 space-y-1 px-2 pt-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              )
            })}
            

          </nav>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className={`hidden md:fixed md:inset-y-0 md:flex md:flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'md:w-16' : 'md:w-56'
      }`}>
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          {/* Toggle button */}
          <div className="flex flex-shrink-0 items-center justify-center px-4 py-3 border-b border-gray-200">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 border border-gray-200"
              title={sidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            >
              <Menu className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
            <nav className="flex-1 space-y-1 px-2 pt-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-brand-100 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <Icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                    {!sidebarCollapsed && item.name}
                  </Link>
                )
              })}

            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-56'}`}>
        <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Logo - right after sidebar */}
            <Link to="/dashboard" className="cursor-pointer flex items-center">
              <Logo size="xl" />
            </Link>
            
            <div className="flex flex-1"></div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Profile link */}
              <Link 
                to="/profile"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors"
                title="View Profile"
              >
                <User className="h-4 w-4" />
                <span>{user?.full_name || 'User'}</span>
              </Link>
              
              {/* Sign out button - right to user name */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout 