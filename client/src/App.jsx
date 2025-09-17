import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for token in localStorage or URL params (for Google OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    const storedToken = localStorage.getItem('token')

    if (urlToken) {
      // Handle Google OAuth callback
      localStorage.setItem('token', urlToken)
      setIsAuthenticated(true)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (storedToken) {
      // Check if stored token exists
      setIsAuthenticated(true)
    }
  }, [])

  console.log('App state:', { isAuthenticated })

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
    </Routes>
  )
}

export default App