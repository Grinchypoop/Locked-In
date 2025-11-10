import { useEffect } from 'react'
import { useTelegram } from './hooks/useTelegram'
import { useAppStore } from './store/useAppStore'
import { apiClient } from './api/client'
import Dashboard from './pages/Dashboard'
import Loading from './components/Loading'
import './App.css'

function App() {
  const { isReady, error } = useTelegram()
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const setNonNegotiables = useAppStore((state) => state.setNonNegotiables)
  const setStreaks = useAppStore((state) => state.setStreaks)

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData()
    }
  }, [isAuthenticated])

  const loadInitialData = async () => {
    try {
      // Load non-negotiables
      const nnResponse = await apiClient.getTodayNonNegotiables()
      setNonNegotiables(nnResponse.data)

      // Load streaks
      const streaksResponse = await apiClient.getStreaksDashboard()
      setStreaks(streaksResponse.data.streaks)
    } catch (err) {
      console.error('Error loading initial data:', err)
    }
  }

  if (error) {
    return (
      <div className="error-container">
        <h1>Authentication Error</h1>
        <p>{error}</p>
        <p>Please open this app from Telegram</p>
      </div>
    )
  }

  if (!isReady || !isAuthenticated) {
    return <Loading />
  }

  return <Dashboard />
}

export default App
