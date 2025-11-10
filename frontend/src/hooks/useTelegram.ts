import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

interface TelegramWebApp {
  ready?: () => void
  initData?: string
  user?: {
    id: number
    username?: string
    first_name?: string
    last_name?: string
  }
  close?: () => void
  expand?: () => void
  requestFullscreen?: () => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setAuthenticated = useAppStore((state) => state.setAuthenticated)

  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp

          // Signal that the web app is ready
          if (tg.ready) {
            tg.ready()
          }

          // Expand to full screen
          if (tg.expand) {
            tg.expand()
          }

          // Get init data
          const initData = tg.initData
          if (!initData) {
            throw new Error('No Telegram init data available')
          }

          // Get user info
          const user = tg.user
          if (!user || !user.id) {
            throw new Error('No user data available')
          }

          // Authenticate with backend
          const response = await fetch('/api/auth/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData }),
          })

          if (!response.ok) {
            throw new Error(`Authentication failed: ${response.statusText}`)
          }

          const data = await response.json()
          setAuthenticated(data.userId, data.telegramId)
          setIsReady(true)
        } else {
          throw new Error('Telegram WebApp not available')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        console.error('Telegram initialization error:', err)
      }
    }

    initializeTelegram()
  }, [setAuthenticated])

  return { isReady, error }
}
