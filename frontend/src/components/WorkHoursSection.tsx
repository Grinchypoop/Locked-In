import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import '../styles/WorkHours.css'

interface WorkHoursData {
  date: string
  hours: number
  notes?: string
}

export default function WorkHoursSection() {
  const [hours, setHours] = useState('')
  const [notes, setNotes] = useState('')
  const [todayHours, setTodayHours] = useState<number>(0)
  const [stats, setStats] = useState<any>(null)
  const [weeklyHours, setWeeklyHours] = useState<WorkHoursData[]>([])

  useEffect(() => {
    loadWorkHoursData()
  }, [])

  const loadWorkHoursData = async () => {
    try {
      const today = await apiClient.getTodayWorkHours()
      setTodayHours(today.data.hours || 0)

      const statsResponse = await apiClient.getWorkHoursStats()
      setStats(statsResponse.data)

      const weeklyResponse = await apiClient.getWeeklyWorkHours()
      setWeeklyHours(weeklyResponse.data)
    } catch (error) {
      console.error('Error loading work hours:', error)
    }
  }

  const handleLogHours = async () => {
    if (!hours || isNaN(parseFloat(hours))) return

    try {
      const today = new Date().toISOString().split('T')[0]
      await apiClient.logWorkHours(today, parseFloat(hours), notes)
      setHours('')
      setNotes('')
      await loadWorkHoursData()
    } catch (error) {
      console.error('Error logging work hours:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="section work-hours">
      <div className="section-header">
        <h2>Work Hours Tracking</h2>
        <div className="today-summary">
          <span className="today-hours">{todayHours.toFixed(1)}h</span>
          <span className="label">Today</span>
        </div>
      </div>

      <div className="stats-grid">
        {stats && (
          <>
            <div className="stat-card">
              <span className="stat-value">{stats.avg_hours_per_day?.toFixed(1) || '0'}h</span>
              <span className="stat-label">Avg/Day</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.total_hours_week?.toFixed(1) || '0'}h</span>
              <span className="stat-label">Week Total</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.days_logged || '0'}</span>
              <span className="stat-label">Days Logged</span>
            </div>
          </>
        )}
      </div>

      <div className="log-form">
        <h3>Log Work Hours</h3>
        <div className="form-row">
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            placeholder="Hours..."
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="input-field"
          />
        </div>
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field"
          rows={2}
        ></textarea>
        <button className="submit-btn" onClick={handleLogHours}>
          Log Hours
        </button>
      </div>

      <div className="history">
        <h3>Weekly History</h3>
        <div className="weekly-list">
          {weeklyHours.map((entry) => (
            <div key={entry.date} className="history-item">
              <span className="date">{formatDate(entry.date)}</span>
              <span className="value">{entry.hours.toFixed(1)}h</span>
              {entry.notes && <span className="notes">{entry.notes}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
