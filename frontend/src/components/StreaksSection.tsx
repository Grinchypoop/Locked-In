import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { apiClient } from '../api/client'
import '../styles/Streaks.css'

export default function StreaksSection() {
  const streaks = useAppStore((state) => state.streaks)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      const response = await apiClient.getStreaksDashboard()
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Error loading summary:', error)
    }
  }

  const getStreakEmoji = (metricType: string) => {
    switch (metricType) {
      case 'non_negotiables':
        return '✓'
      case 'workouts':
        return '💪'
      case 'work_hours':
        return '⏱'
      default:
        return '🔥'
    }
  }

  const getStreakLabel = (metricType: string) => {
    switch (metricType) {
      case 'non_negotiables':
        return 'Non-Negotiables'
      case 'workouts':
        return 'Workouts'
      case 'work_hours':
        return 'Work Hours'
      default:
        return metricType
    }
  }

  return (
    <div className="grid-item streaks">
      <h2>🔥 Streaks Dashboard</h2>

      {summary && (
        <div className="summary-stats">
          <div className="summary-item">
            <span className="label">Active Streaks</span>
            <span className="value">{summary.total_streaks}</span>
          </div>
          <div className="summary-item">
            <span className="label">Avg Streak</span>
            <span className="value">{summary.average_streak_length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Completion</span>
            <span className="value">{summary.completion_percentage}%</span>
          </div>
        </div>
      )}

      <div className="streaks-list">
        {streaks.map((streak) => (
          <div key={streak.metric_type} className="streak-item">
            <div className="streak-header">
              <span className="emoji">{getStreakEmoji(streak.metric_type)}</span>
              <span className="label">{getStreakLabel(streak.metric_type)}</span>
            </div>
            <div className="streak-stats">
              <div className="streak-current">
                <span className="number">{streak.current_streak}</span>
                <span className="text">current</span>
              </div>
              <div className="streak-best">
                <span className="number">{streak.best_streak}</span>
                <span className="text">best</span>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min((streak.current_streak / streak.best_streak) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
