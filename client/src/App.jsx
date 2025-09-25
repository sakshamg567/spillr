import React from 'react'
import { AuthProvider } from './hooks/useAuth'
import LandingPage from './components/LandingPage'
import './App.css'

const App = () => {
  return (
    <AuthProvider>
      <div>
        <LandingPage />
      </div>
    </AuthProvider>
  )
}

export default App