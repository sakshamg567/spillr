import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProfileSettings from './pages/ProfileSettings'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Check for token in localStorage or URL params (for Google OAuth callback)
    const urlParams = new URLSearchParams(location.search)
    const urlToken = urlParams.get('token')
    const storedToken = localStorage.getItem('token')
    
    // Check for OAuth errors
    const oauthError = urlParams.get('error')
    if (oauthError) {
      console.error('OAuth error:', oauthError)
      localStorage.removeItem('token') // Clear any existing token
      setIsAuthenticated(false)
      setAuthLoading(false)
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    if (urlToken) {
      console.log('✅ Token received from OAuth callback')
      // Handle Google OAuth callback
      localStorage.setItem('token', urlToken)
      setIsAuthenticated(true)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (storedToken) {
      console.log('✅ Existing token found in localStorage')
      // Check if stored token exists
      setIsAuthenticated(true)
    } else {
      console.log('❌ No token found')
    }
    
    setAuthLoading(false)
  }, [location])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  console.log('App state:', { isAuthenticated, authLoading })

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <Login setIsAuthenticated={setIsAuthenticated} />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <Register setIsAuthenticated={setIsAuthenticated} />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? 
          <Dashboard setIsAuthenticated={setIsAuthenticated} /> : 
          <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/profile-settings" 
        element={
          isAuthenticated ? 
          <ProfileSettings /> : 
          <Navigate to="/login" replace />
        } 
      />
    </Routes>
  )
}

export default App