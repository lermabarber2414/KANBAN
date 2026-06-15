import React, { useState, useEffect } from 'react'
import SetupPage from './pages/SetupPage.jsx'
import BoardPage from './pages/BoardPage.jsx'
import { getStoredConfig, clearStoredConfig } from './utils/storage.js'

/**
 * Root application component.
 * Decides whether to show the setup/config screen or the main Kanban board.
 */
export default function App() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount, check if a valid config already exists in localStorage
    const stored = getStoredConfig()
    if (stored) setConfig(stored)
    setLoading(false)
  }, [])

  const handleConfigSaved = (newConfig) => {
    setConfig(newConfig)
  }

  const handleLogout = () => {
    clearStoredConfig()
    setConfig(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!config) {
    return <SetupPage onConfigSaved={handleConfigSaved} />
  }

  return <BoardPage config={config} onLogout={handleLogout} />
}
